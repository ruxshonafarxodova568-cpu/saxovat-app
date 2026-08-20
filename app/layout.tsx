import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Saxovat — bepul ulashish platformasi",
  description:
    "O'zbekiston bo'ylab kitob, kiyim va o'quv materiallarini bepul ulashing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className={`${fraunces.variable} ${inter.variable}`}>
        <Header />
        <main>{children}</main>
        <footer className="border-t border-line py-6 text-center text-sm text-ink-soft">
          Saxovat &middot; O'zbekiston bo'ylab bepul ulashish platformasi
        </footer>
      </body>
    </html>
  );
}
