import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { getProfile, getSettings } from "@/actions/admin";
import { getFallbackPortfolioData } from "@/lib/fallbackData";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mudasirch.netlify.app";
const metadataBase = new URL(siteUrl);
const ogImageUrl = new URL("/og-image.jpg", metadataBase).toString();

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase,
  manifest: "/manifest.json",
  icons: {
    icon: "/profile.png",
    shortcut: "/profile.png",
    apple: "/profile.png",
  },
  title: {
    default: "Mudasir Choudhry | Creative Full Stack Developer",
    template: "%s | Mudasir Choudhry",
  },
  description: "Specializing in Next.js, 3D Web Experiences, and Automation. Building the future of the web, one pixel at a time.",
  keywords: ["Next.js", "React", "Three.js", "Portfolio", "Web Developer", "Automation", "Mudasir Choudhry"],
  authors: [{ name: "Mudasir Choudhry" }],
  creator: "Mudasir Choudhry",
  publisher: "Mudasir Choudhry",
  category: "technology",
  alternates: {
    canonical: siteUrl,
  },
  applicationName: "Mudasir Choudhry Portfolio",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  openGraph: {
    title: "Mudasir Choudhry | Creative Full Stack Developer",
    description: "Specializing in Next.js, 3D Web Experiences, and Automation.",
    url: siteUrl,
    siteName: "Mudasir Choudhry Portfolio",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "Mudasir Choudhry Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mudasir Choudhry | Creative Full Stack Developer",
    description: "Building the future of the web, one pixel at a time.",
    images: [ogImageUrl],
    creator: "@Mudasir345",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030014",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [profile, settings] = await Promise.all([
    getProfile().catch(() => null),
    getSettings().catch(() => null),
  ]);
  const fallback = getFallbackPortfolioData();

  return (
    <html lang="en" suppressHydrationWarning className={outfit.className}>
      <body className="bg-[#030014] overflow-y-scroll overflow-x-hidden antialiased">
        <Navbar profile={profile ?? fallback.profile} settings={settings ?? fallback.settings} />
        {children}
      </body>
    </html>
  );
}
