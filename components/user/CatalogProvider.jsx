'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api, cartLines, shapeCategory, shapeProduct } from '@/lib/apiClient';
import { lineFromProduct, splitLineKey } from '@/lib/variants';
import {
  mergeGuestBag,
  readGuestCart,
  readGuestWishlist,
  writeGuestCart,
  writeGuestWishlist,
} from '@/lib/guestBag';

const CatalogContext = createContext(null);

async function resolveProducts(ids, catalog) {
  const map = new Map(catalog.map((product) => [String(product.id), product]));
  const missing = [...new Set(ids.map(String))].filter((id) => id && !map.has(id));
  await Promise.all(
    missing.map(async (id) => {
      try {
        const product = shapeProduct(await api(`/api/products/${id}`));
        map.set(product.id, product);
      } catch {
        /* product removed */
      }
    }),
  );
  return map;
}

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartNotice, setCartNotice] = useState(null);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const userRef = useRef(null);
  const productsRef = useRef([]);
  const snapshotsRef = useRef(new Map());
  const cartItemsRef = useRef([]);
  const drawerOpenedRef = useRef(false);

  const remember = (product) => {
    if (!product) return;
    const id = String(product.id || product._id || '');
    if (!id) return;
    snapshotsRef.current.set(id, { ...product, id });
  };

  const applyGuest = async (catalog, known = []) => {
    known.filter(Boolean).forEach(remember);
    const stored = readGuestCart();
    const wish = readGuestWishlist();
    const map = await resolveProducts(
      [...stored.map((row) => row.productId), ...wish],
      [...catalog, ...snapshotsRef.current.values()],
    );
    map.forEach((product) => remember(product));
    setCartItems(
      stored
        .map((row) => {
          const product = map.get(row.productId);
          if (!product) return null;
          return lineFromProduct(product, row);
        })
        .filter(Boolean),
    );
    const saved = wish.filter((id) => map.has(id));
    setWishlistIds(saved);
    setWishlistItems(saved.map((id) => map.get(id)));
  };

  const applyServer = async () => {
    const [cart, wishlist] = await Promise.all([api('/api/cart'), api('/api/wishlist')]);
    setCartItems(cartLines(cart));
    const saved = (wishlist.products || []).map(shapeProduct);
    setWishlistItems(saved);
    setWishlistIds(saved.map((product) => product.id));
  };

  const refreshSession = async () => {
    let me = null;
    try {
      me = await api('/api/auth/me');
    } catch {
      me = null;
    }
    userRef.current = me;
    setUser(me);
    if (me && (readGuestCart().length || readGuestWishlist().length)) {
      await mergeGuestBag();
    }
    if (me) await applyServer();
    else await applyGuest(productsRef.current);
    setAuthReady(true);
    return me;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [productData, categoryData] = await Promise.all([
        api('/api/products?limit=100').catch(() => ({ products: [] })),
        api('/api/categories').catch(() => []),
      ]);
      if (cancelled) return;
      const shaped = (productData.products || []).map(shapeProduct);
      productsRef.current = shaped;
      setProducts(shaped);
      setCategories((Array.isArray(categoryData) ? categoryData : []).map(shapeCategory));
      await refreshSession();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openCart = useCallback(() => {
    setCartNotice(null);
    setCartOpen(true);
  }, []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const dismissCartNotice = useCallback(() => setCartNotice(null), []);

  useEffect(() => {
    cartItemsRef.current = cartItems;
    if (cartItems.length === 0) drawerOpenedRef.current = false;
  }, [cartItems]);

  const showAddedNotice = (snapshot) => {
    setCartNotice({
      key: Date.now(),
      name: snapshot?.name || 'Item',
      image: snapshot?.image || '',
    });
  };

  const addToCart = async (productId, qty = 1, snapshot, variant, behavior = {}) => {
    const id = String(productId);
    const amount = Math.max(1, Math.min(20, Number(qty) || 1));
    const sku = variant?.sku || snapshot?.sku || '';
    const options = variant?.options || [];
    const known = snapshot ? [{ ...snapshot, id }] : [];
    const storedEmpty = userRef.current
      ? cartItemsRef.current.length === 0
      : readGuestCart().length === 0;
    const wasEmpty = storedEmpty && !drawerOpenedRef.current;
    if (wasEmpty) drawerOpenedRef.current = true;

    try {
      if (userRef.current) {
        const cart = await api('/api/cart', {
          method: 'POST',
          body: JSON.stringify({ productId: id, qty: amount, sku, options }),
        });
        const lines = cartLines(cart);
        cartItemsRef.current = lines;
        setCartItems(lines);
      } else {
        const next = readGuestCart();
        const hit = next.find((row) => row.productId === id && (row.sku || '') === sku);
        if (hit) hit.qty = Math.min(20, hit.qty + amount);
        else next.push({ productId: id, qty: amount, sku, options });
        writeGuestCart(next);
        await applyGuest(productsRef.current, known);
      }
    } catch (error) {
      if (wasEmpty && (userRef.current ? cartItemsRef.current.length === 0 : readGuestCart().length === 0)) {
        drawerOpenedRef.current = false;
      }
      throw error;
    }

    if (behavior.quiet) return;
    if (wasEmpty) setCartOpen(true);
    else showAddedNotice(snapshot);
  };

  const updateQty = async (lineId, qty) => {
    const { productId, sku } = splitLineKey(lineId);
    if (userRef.current) {
      const cart = await api('/api/cart', {
        method: 'PUT',
        body: JSON.stringify({ productId, sku, qty }),
      });
      setCartItems(cartLines(cart));
      return;
    }
    const next = readGuestCart()
      .map((row) =>
        row.productId === productId && (row.sku || '') === sku
          ? { ...row, qty: Math.min(20, Math.max(0, Number(qty) || 0)) }
          : row,
      )
      .filter((row) => row.qty > 0);
    writeGuestCart(next);
    await applyGuest(productsRef.current);
  };

  const removeFromCart = async (lineId) => {
    const { productId, sku } = splitLineKey(lineId);
    if (userRef.current) {
      const cart = await api('/api/cart', {
        method: 'DELETE',
        body: JSON.stringify({ productId, sku }),
      });
      setCartItems(cartLines(cart));
      return;
    }
    writeGuestCart(readGuestCart().filter((row) => !(row.productId === productId && (row.sku || '') === sku)));
    await applyGuest(productsRef.current);
  };

  const clearCart = async () => {
    if (userRef.current) {
      await Promise.all(
        cartItems.map((item) =>
          api('/api/cart', {
            method: 'DELETE',
            body: JSON.stringify(splitLineKey(item.lineId)),
          }),
        ),
      );
      setCartItems([]);
      return;
    }
    writeGuestCart([]);
    setCartItems([]);
  };

  const toggleWishlist = async (productId) => {
    const id = String(productId);
    if (userRef.current) {
      const wishlist = await api('/api/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId: id }),
      });
      const saved = (wishlist.products || []).map(shapeProduct);
      setWishlistItems(saved);
      setWishlistIds(saved.map((product) => product.id));
      return;
    }
    const current = readGuestWishlist();
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    writeGuestWishlist(next);
    await applyGuest(productsRef.current);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CatalogContext.Provider
      value={{
        products,
        categories,
        cartCount,
        cartItems,
        cartOpen,
        cartNotice,
        openCart,
        closeCart,
        dismissCartNotice,
        wishlistIds,
        wishlistItems,
        user,
        authReady,
        refreshCart: refreshSession,
        refreshSession,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isWishlisted: (id) => wishlistIds.includes(String(id)),
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  return (
    useContext(CatalogContext) || {
      products: [],
      categories: [],
      cartCount: 0,
      cartItems: [],
      cartOpen: false,
      cartNotice: null,
      openCart: () => {},
      closeCart: () => {},
      dismissCartNotice: () => {},
      wishlistIds: [],
      wishlistItems: [],
      user: null,
      authReady: false,
      refreshCart: async () => {},
      refreshSession: async () => {},
      addToCart: async () => {},
      updateQty: async () => {},
      removeFromCart: async () => {},
      clearCart: async () => {},
      toggleWishlist: async () => {},
      isWishlisted: () => false,
    }
  );
}
