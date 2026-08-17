"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Tooltip } from "@/components/ui/tooltip";
import type { ThemeMode } from "@/types/data";

export function ThemeToggle({ currentTheme }: { currentTheme: ThemeMode }) {
  const { setTheme } = useTheme();
  const nextTheme: ThemeMode = currentTheme === "light" ? "dark" : "light";
  const label = currentTheme === "light" ? "切换到夜间模式" : "切换到白天模式";

  const toggleTheme = () => {
    setTheme(nextTheme);
    window.localStorage.setItem("cp-202601-platform-theme", nextTheme);
  };

  return (
    <Tooltip content={label}>
      <div className="theme-control-slot">
        <button
          type="button"
          className="theme-toggle"
          aria-label={label}
          onClick={toggleTheme}
          data-testid="theme-toggle"
        >
          {currentTheme === "light" ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
        </button>
      </div>
    </Tooltip>
  );
}
