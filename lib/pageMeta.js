import { isPreviewDeployment } from '@/lib/site';

const DEFAULT_IMAGE = {
  url: '/og-default.jpg',
  width: 1200,
  height: 630,
  alt: 'Sudhaga – festive ethnic wear',
};

const PUBLIC_ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
};

export function pageHead({
  title,
  description,
  canonical,
  indexable = true,
  images,
  type = 'website',
  absoluteTitle = false,
}) {
  const picture = images?.length ? images : [DEFAULT_IMAGE];
  const listed = indexable && !isPreviewDeployment();
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    robots: listed
      ? PUBLIC_ROBOTS
      : {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false },
        },
    openGraph: {
      type,
      siteName: 'Sudhaga',
      locale: 'en_IN',
      url: canonical,
      title,
      description,
      images: picture,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: picture.map((image) => (typeof image === 'string' ? image : image.url)),
    },
  };
}
