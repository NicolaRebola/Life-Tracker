import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppBackground from "@/components/atoms/AppBackground";
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
  description: ""
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
        <AppBackground />
        <div className="relative z-10 flex min-h-dvh flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
