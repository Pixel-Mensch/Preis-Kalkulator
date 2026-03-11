import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";

import { getCompanySettingsState } from "@/lib/company";

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

function getWebsiteUrl(website: string | null | undefined) {
  if (!website) {
    return undefined;
  }

  try {
    return new URL(website);
  } catch {
    try {
      return new URL(`https://${website}`);
    } catch {
      return undefined;
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { companySettings, isConfigured } = await getCompanySettingsState();
  const companyName = isConfigured ? companySettings.companyName : "Entrümpelungs-Anfrage";
  const metadataBase = isConfigured ? getWebsiteUrl(companySettings.website) : undefined;
  const title = isConfigured
    ? `${companyName} | Entrümpelung anfragen`
    : "Entrümpelungs-Anfrage | Einrichtung läuft";
  const description = isConfigured
    ? `Unverbindliche Kostenschätzung für Entrümpelung, Haushaltsauflösung und Räumung in ${companySettings.city}. Preisrahmen online anfragen und direkt mit ${companyName} abstimmen.`
    : "Die öffentliche Anfrage wird gerade eingerichtet. Firmendaten, Einsatzgebiet und Preislogik werden noch vorbereitet.";

  return {
    metadataBase,
    title: {
      default: title,
      template: `%s | ${companyName}`,
    },
    description,
    applicationName: companyName,
    keywords: [
      "Entrümpelung",
      "Haushaltsauflösung",
      "Räumung",
      "Preisrahmen",
      "Kostenschätzung",
      ...(isConfigured ? [companySettings.city] : ["Anfrage-Rechner"]),
    ],
    alternates: metadataBase ? { canonical: "/" } : undefined,
    openGraph: {
      type: "website",
      locale: "de_DE",
      siteName: companyName,
      title,
      description,
      url: metadataBase,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    robots: isConfigured
      ? {
          index: true,
          follow: true,
        }
      : {
          index: false,
          follow: false,
        },
  };
}

export const viewport: Viewport = {
  themeColor: "#f4efe6",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${manrope.variable} ${plexMono.variable} bg-[var(--background)] text-slate-950 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
