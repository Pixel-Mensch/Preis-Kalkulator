import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Entrümpler Angebotsrechner V1",
  description:
    "Mobiler Entrümpelungsrechner mit unverbindlicher Kostenschätzung, Anfrageflow und Adminbereich.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${manrope.variable} ${plexMono.variable} bg-stone-50 text-slate-950 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
