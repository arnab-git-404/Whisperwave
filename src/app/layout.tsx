import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "../context/AuthProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WhisperWave",
  description: "Send Message Anonymously.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" >
      <AuthProvider>
        <body className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 ">
          {children}
          <Toaster />
        </body>
      </AuthProvider>
    </html>
  );
};
