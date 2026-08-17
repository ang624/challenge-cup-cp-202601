"use client";

import { BarChart3, Check, Copy, FileSearch, FlaskConical, MoreHorizontal, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlatform } from "@/contexts/platform-context";
import type { ThemeMode } from "@/types/data";

export function ResearchHeader() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { viewMode, setViewMode } = usePlatform();
  const [linkCopied, setLinkCopied] = useState(false);
  const theme: ThemeMode = resolvedTheme === "dark" ? "dark" : "light";

  const handleViewKey = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    setViewMode(event.key === "ArrowLeft" ? "strategy" : "research");
  };

  async function copyCurrentLink() {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 1800);
  }

  return (
    <header className="research-header">
      <div className="system-title"><span>国家能源集团未来能源产业研究</span><strong>交通场景钙钛矿光伏产业推演与示范准入辅助系统</strong></div>
      <div className="header-actions">
        <div className="view-switch" role="group" aria-label="浏览模式">
          <button aria-pressed={viewMode === "strategy"} className={viewMode === "strategy" ? "active" : ""} onKeyDown={handleViewKey} onClick={() => setViewMode("strategy")}><BarChart3 />战略视图</button>
          <button aria-pressed={viewMode === "research"} className={viewMode === "research" ? "active" : ""} onKeyDown={handleViewKey} onClick={() => setViewMode("research")}><FlaskConical />研究视图</button>
        </div>
        <ThemeToggle currentTheme={theme} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="icon-button" type="button" aria-label="更多选项"><MoreHorizontal /></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => void copyCurrentLink()}>
              {linkCopied ? <Check /> : <Copy />}
              <span>{linkCopied ? "链接已复制" : "复制当前页面链接"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/evidence")}>
              <FileSearch />
              <span>打开证据审计</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => window.location.reload()}>
              <RefreshCw />
              <span>重新载入审核结果</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
