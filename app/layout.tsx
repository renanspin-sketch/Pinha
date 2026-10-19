import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { lerTema } from "@/lib/tema";

export const metadata: Metadata = {
  title: "Pinha",
  description: "As finanças da casa, em um lugar só.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/pinha-mark.svg", apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = { themeColor: "#0f3d33" };

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Manrope:wght@500;600;700;800&display=swap";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tema = lerTema((await cookies()).get("pinha_tema")?.value);
  return (
    <html lang="pt-BR" data-theme={tema === "system" ? undefined : tema}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS_HREF} />
      </head>
      <body>{children}</body>
    </html>
  );
}
