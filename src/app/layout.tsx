import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { BackgroundSlideshow } from "@/components/agi-hub/BackgroundSlideshow";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AGI Navigation Hub | 中央思考導航中心",
  description: "獨立的 AGI 控制平面，管理全球職人智庫與 AI 邏輯導航。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.className} bg-slate-950 text-slate-200 antialiased relative`}>
        <BackgroundSlideshow />
        <div className="relative z-10">
          {children}
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
