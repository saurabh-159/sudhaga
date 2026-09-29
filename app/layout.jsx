import "./globals.css";
import { BRAND } from "@/lib/brand";

export const metadata = {
  title: {
    default: BRAND.name,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.tagline,
  icons: {
    icon: [
      { url: BRAND.favicon["16"], sizes: "16x16", type: "image/png" },
      { url: BRAND.favicon["32"], sizes: "32x32", type: "image/png" },
      { url: BRAND.mark.icon, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: BRAND.favicon.apple, sizes: "180x180", type: "image/png" }],
    shortcut: BRAND.favicon["32"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
