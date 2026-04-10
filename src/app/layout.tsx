import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RESPECTProvider } from "@/components/RESPECTProvider";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RESPECT Games | Kokeb Learning Cloud",
  description: "High-quality educational games integrated with the RESPECT ecosystem.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body 
        className="min-h-full flex flex-col relative overflow-x-hidden"
        suppressHydrationWarning
      >
        {/* Native App Background Image */}
        <div 
          className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat pointer-events-none transition-opacity duration-1000"
          style={{ backgroundImage: 'url("/background.png")' }}
        />
        
        {/* Soft Blueish Overlay - More Transparent */}
        <div className="fixed inset-0 -z-10 bg-[#AEE2FF]/65 backdrop-blur-[1px] pointer-events-none" />

        <Suspense fallback={null}>
          <RESPECTProvider>
            {children}
          </RESPECTProvider>
        </Suspense>
      </body>
    </html>
  );
}
