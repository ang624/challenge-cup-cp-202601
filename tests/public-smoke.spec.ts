import { expect, test } from "@playwright/test";

const pages = ["strategic", "baseline", "technology", "station", "yunnan", "cultivation", "evidence"];

test("public deployment exposes all seven decision pages", async ({ page }) => {
  for (const slug of pages) {
    const response = await page.goto(`/${slug}?view=strategy`);
    expect(response?.status(), slug).toBe(200);
    await expect(page.locator("body"), slug).not.toContainText("数据加载失败");
  }
});

test("root redirects and health endpoint reveal no secrets", async ({ page, request }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/strategic/);
  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  const text = await health.text();
  expect(text).not.toContain("BLOB_READ_WRITE_TOKEN");
  expect(text).not.toContain("private-data");
});
