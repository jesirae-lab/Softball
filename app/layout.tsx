import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Rec League — Co-Ed Softball 2026",
  description: "Co-ed softball league management: standings, schedule & team communication",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-[#1e3a5f] text-blue-300 text-center text-xs py-4 mt-8">
          ⚾ Rec League Co-Ed Softball 2026 &nbsp;|&nbsp; Season runs Mar – May
        </footer>
      </body>
    </html>
  );
}
