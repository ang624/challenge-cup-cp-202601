import type { Metadata } from "next";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { PlatformProvider } from "@/contexts/platform-context";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: {
    default: "挑战杯研究决策平台",
    template: "%s｜挑战杯研究决策平台",
  },
  description: "交通场景钙钛矿光伏产业推演与示范准入辅助系统",
  applicationName: "CP-202601未来能源产业研究决策平台",
  icons: { icon: `${basePath}/assets/brand-logo.png` },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Suspense fallback={<div className="app-loading">正在加载研究数据…</div>}>
            <PlatformProvider>{children}</PlatformProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
