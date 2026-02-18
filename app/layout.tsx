import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paris à Pied - Tour des petites adresses",
  description: "Découvrez les meilleures petites adresses de Paris",
  manifest: "/manifest.webmanifest",
  themeColor: "#10b981",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    viewportFit: "cover",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Paris à Pied",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
      </head>
      <body>{children}</body>
    </html>
  );
}
