import { notFound, permanentRedirect } from 'next/navigation';
import ProductDetails from '@/components/user/ProductDetails';
import JsonLd from '@/components/seo/JsonLd';
import { resolveProductPath, getRelatedProducts } from '@/lib/catalog';
import { pageTitle, productCrumbs, productPath } from '@/lib/storePath';
import { cleanCanonical } from '@/lib/canonical';
import { breadcrumbSchema, productSchema } from '@/lib/schema';
import { metaDescription } from '@/lib/site';
import { pageHead } from '@/lib/pageMeta';

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const resolved = await resolveProductPath(slug).catch(() => null);
  const product = resolved?.product;
  if (resolved?.redirect) {
    return pageHead({
      title: 'Product',
      description: 'This product has moved to its current Sudhaga page.',
      canonical: resolved.redirect,
      indexable: false,
    });
  }
  if (!product) {
    return pageHead({
      title: 'Product not found',
      description: 'That product is not available at Sudhaga.',
      canonical: '/products',
      indexable: false,
    });
  }
  const title = pageTitle(product.seoTitle, product.name);
  const description = metaDescription(
    product.metaDescription || product.description,
    `${product.name}${product.categoryName ? ` — ${product.categoryName}` : ''} at Sudhaga.`,
  );
  const canon = cleanCanonical(productPath(product), sp);
  return pageHead({
    title,
    description,
    canonical: canon.alternates.canonical,
    indexable: !canon.robots,
    images: product.image ? [{ url: product.image, alt: product.name }] : undefined,
  });
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  let resolved;
  try {
    resolved = await resolveProductPath(slug);
  } catch {
    return (
      <p className="px-4 py-16 text-center">This product is temporarily unavailable. Please try again.</p>
    );
  }
  if (!resolved) notFound();
  if (resolved.redirect) permanentRedirect(resolved.redirect);
  const product = resolved.product;
  const related = await getRelatedProducts(product).catch(() => []);
  const crumbs = productCrumbs(product);
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={productSchema({
          ...product,
          href: productPath(product),
        })}
      />
      <ProductDetails product={product} relatedProducts={related} />
    </>
  );
}
