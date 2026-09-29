"use client";

import { createContext } from "react";

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  return <CartContext.Provider value={null}>{children}</CartContext.Provider>;
}
