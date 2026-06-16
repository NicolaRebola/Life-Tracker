import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppBackground from "@/components/atoms/AppBackground";
import ServiceWorkerRegistration from "@/components/atoms/ServiceWorkerRegistration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
 
export const metadata: Metadata = {
  title: "Life Tracker",
  description:
    "Track personal events, thoughts, groups, and life activity.",
  applicationName: "Life Tracker",
  appleWebApp: {
    capable: true,
    title: "Life Tracker",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#a86449",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="bg-[#f6eadf] text-title-50">
        <ServiceWorkerRegistration />
        <AppBackground />
        <div className="relative z-10 flex min-h-dvh flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
