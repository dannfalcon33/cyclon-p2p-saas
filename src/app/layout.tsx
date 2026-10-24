import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Cyclon P2P — Dashboard & Bitácora de Operaciones P2P",
  description:
    "Control centralizado de operaciones P2P para Binance, Bybit y Bitget. Comisiones por país, exportaciones contables en Excel y analítica avanzada.",
};

import { ToastProvider } from "@/components/ui/toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#08090d] text-slate-100 selection:bg-[#00ff66] selection:text-black">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
