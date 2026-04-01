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
        {/* Premium Background Decorations */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] rounded-full bg-blue-400/10 blur-[100px]" />
        </div>

        <Suspense fallback={null}>
          <RESPECTProvider>
            {children}
          </RESPECTProvider>
        </Suspense>
      </body>
    </html>
  );
}
