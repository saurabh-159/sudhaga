import "./globals.css";
import { getSiteUrl, HOME_DESCRIPTION, HOME_TITLE, isPreviewDeployment } from "@/lib/site";

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: "Sudhaga",
  title: {
    default: HOME_TITLE,
    template: `%s · Sudhaga`,
  },
  description: HOME_DESCRIPTION,
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  robots: isPreviewDeployment()
    ? { index: false, follow: false }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
  openGraph: {
    type: "website",
    siteName: "Sudhaga",
    locale: "en_IN",
    url: "/",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Sudhaga – festive ethnic wear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["/og-default.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
