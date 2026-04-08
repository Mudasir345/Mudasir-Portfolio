import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { getProfile } from "@/actions/admin";

export const metadata: Metadata = {
  metadataBase: new URL("https://mudasirchoudhry.com"),
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
    canonical: "/",
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
    url: "https://mudasirchoudhry.com",
    siteName: "Mudasir Choudhry Portfolio",
    images: [
      {
        url: "/og-image.jpg",
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
    images: ["/og-image.jpg"],
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
  const profile = await getProfile();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#030014] overflow-y-scroll overflow-x-hidden antialiased">
        <Navbar profile={profile} />
        {children}
      </body>
    </html>
  );
}
