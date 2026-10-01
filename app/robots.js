import { getSiteUrl } from '@/lib/site';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/api/',
        '/login',
        '/cart',
        '/checkout',
        '/account',
        '/profile',
        '/orders',
        '/wishlist',
        '/*?*search=',
        '/*?*sort=',
        '/*?*filter=',
        '/*?*color=',
        '/*?*size=',
        '/*?*variant=',
      ],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
