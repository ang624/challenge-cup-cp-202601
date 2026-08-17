import { expect, test } from "@playwright/test";

const pages = ["strategic", "baseline", "technology", "station", "yunnan", "cultivation", "evidence"];
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

test("public deployment exposes all seven decision pages", async ({ page }) => {
  for (const slug of pages) {
    const response = await page.goto(`${basePath}/${slug}?view=strategy`);
    expect(response?.status(), slug).toBe(200);
    await expect(page.locator("body"), slug).not.toContainText("数据加载失败");
  }
});

test("root redirects to the strategic overview", async ({ page }) => {
  await page.goto(`${basePath}/`);
  await expect(page).toHaveURL(new RegExp(`${basePath}/strategic`));
});
