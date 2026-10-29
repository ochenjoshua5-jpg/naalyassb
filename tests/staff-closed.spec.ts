import { expect, test } from "@playwright/test";

/**
 * Public preview state (production build, STAFF_DASHBOARD unset): the staff portal does not exist.
 * Every staff path answers 404, and the public site is unchanged.
 */

const STAFF_PATHS = [
  "/staff",
  "/staff/dashboard",
  "/staff/enquiries",
  "/staff/content",
  "/staff/guide",
  "/staff/sign-in",
  "/staff/sign-up",
  "/staff/sign-up/factor-one",
];

test("every staff page answers 404 in the public preview", async ({ request }) => {
  for (const path of STAFF_PATHS) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(404);
  }
});

test("staff APIs answer 404 (the feature is hidden, not refused)", async ({ request }) => {
  const list = await request.get("/api/staff/enquiries");
  expect(list.status()).toBe(404);
  expect(await list.json()).toEqual({ error: "Not found" });
  const patch = await request.patch("/api/staff/enquiries/00000000-0000-4000-8000-000000000000", {
    headers: { "content-type": "application/json" },
    data: JSON.stringify({ status: "contacted" }),
  });
  expect(patch.status()).toBe(404);
  const del = await request.delete("/api/staff/enquiries/00000000-0000-4000-8000-000000000000");
  expect(del.status()).toBe(404);
});

test("staff pages are not indexed and send no staff data", async ({ page }) => {
  const response = await page.goto("/staff/dashboard");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Enquiries", { exact: true })).toHaveCount(0);
});

test("the public site still renders its header, main content and footer", async ({ page }) => {
  await page.goto("/admissions");
  await expect(page.locator("main#main")).toHaveCount(1);
  await expect(page.getByRole("link", { name: /admissions/i }).first()).toBeVisible();
  await expect(page.locator("footer").first()).toBeVisible();
});

test("no sign-in or sign-up control is linked from the public site", async ({ request }) => {
  const response = await request.get("/admissions");
  const html = await response.text();
  expect(html).not.toContain("/staff");
  expect(html).not.toContain("sign-up");
});
