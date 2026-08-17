import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3001",
    channel: "chrome",
    viewport: { width: 1920, height: 1080 },
    locale: "zh-CN",
    colorScheme: "light",
  },
  reporter: [["line"]],
});
