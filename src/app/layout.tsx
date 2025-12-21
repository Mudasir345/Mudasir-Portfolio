import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { getProfile } from "@/actions/admin";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mudasir Choudhry | Creative Full Stack Developer",
  description: "Specializing in Next.js, 3D Web Experiences, and Automation. Building the future of the web, one pixel at a time.",
  keywords: ["Next.js", "React", "Three.js", "Portfolio", "Web Developer", "Automation", "Mudasir Choudhry"],
  authors: [{ name: "Mudasir Choudhry" }],
  openGraph: {
    title: "Mudasir Choudhry | Creative Full Stack Developer",
    description: "Specializing in Next.js, 3D Web Experiences, and Automation.",
    url: "https://mudasirchoudhry.com",
    siteName: "Mudasir Choudhry Portfolio",
    images: [
      {
        url: "/og-image.png",
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
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL('https://mudasirchoudhry.com'),
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#030014',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getProfile();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#030014] overflow-y-scroll overflow-x-hidden`}>
        <Navbar profile={profile} />
        {children}
      </body>
    </html>
  );
}
