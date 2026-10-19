import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pinha",
  description: "As finanças da casa, em um lugar só.",
  icons: { icon: "/pinha-mark.svg", apple: "/icons/icon-192.png" },
};

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Manrope:wght@500;600;700;800&display=swap";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS_HREF} />
      </head>
      <body>{children}</body>
    </html>
  );
}
