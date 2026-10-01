import { BRAND } from '@/lib/brand';
import { getSiteUrl } from '@/lib/site';

function absolute(path) {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absolute(item.href),
    })),
  };
}

export function siteSchema() {
  const url = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: BRAND.name,
        url,
        logo: absolute(BRAND.logo.light),
      },
      {
        '@type': 'WebSite',
        name: BRAND.name,
        url,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${url}/products?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

export function articleSchema(article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt || article.title,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    image: article.image ? absolute(article.image) : undefined,
    author: { '@type': 'Organization', name: BRAND.name },
    publisher: {
      '@type': 'Organization',
      name: BRAND.name,
      logo: { '@type': 'ImageObject', url: absolute(BRAND.logo.light) },
    },
    mainEntityOfPage: absolute(`/blog/${article.slug}`),
  };
}

export function productSchema(product) {
  const url = absolute(product.href);
  const images = [product.image, ...(product.images || [])].filter(Boolean).map(absolute);
  const inStock = Number(product.stock || 0) > 0;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name,
    sku: product.id,
    image: images.length ? images : undefined,
    brand: { '@type': 'Brand', name: BRAND.name },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'INR',
      price: Number(product.price || 0).toFixed(2),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
  const reviews = Number(product.numReviews || 0);
  const rating = Number(product.rating || 0);
  if (reviews > 0 && rating > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: reviews,
    };
  }
  return data;
}
