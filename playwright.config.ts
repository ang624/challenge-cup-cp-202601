import { defineConfig } from "@playwright/test";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3002",
    channel: "chrome",
    viewport: { width: 1920, height: 1080 },
    locale: "zh-CN",
    colorScheme: "light",
  },
  webServer: {
    command: "npm run start:static",
    url: `http://127.0.0.1:3002${basePath}/strategic/`,
    reuseExistingServer: true,
  },
  reporter: [["line"]],
});
