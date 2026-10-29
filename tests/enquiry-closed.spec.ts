import { expect, test } from "@playwright/test";
import { syntheticEnquiry, uniqueTestIp } from "./support/synthetic";
import { recordsWithDigits } from "./support/test-store";

/**
 * Public preview state. Server on port 3000 runs with ENQUIRY_STORE=disabled, the same as production
 * until the school approves the form. The form must not appear, the API must refuse, and the
 * verified routes must be present.
 */

const HUB_URL = "https://hub.naalyaschools.ac.ug/naalya-secondary-school/apply";
const SCHOOL_ENQUIRY_URL = "https://naalyaschools.ac.ug/admissions";

test.describe("enquiry disabled (public preview)", () => {
  test("enquiry page explains the form is not open and shows no form", async ({ page }) => {
    await page.goto("/admissions/enquiry");
    await expect(page.getByRole("heading", { name: "Online enquiries aren’t open yet" })).toBeVisible();
    await expect(page.locator("form")).toHaveCount(0);
    await expect(page.getByLabel(/Parent or guardian/)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Send enquiry" })).toHaveCount(0);
  });

  test("enquiry page is not indexed", async ({ page }) => {
    await page.goto("/admissions/enquiry");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("fallback routes are verified and no unconfirmed phone or email is shown", async ({ page }) => {
    await page.goto("/admissions/enquiry");
    await expect(page.getByRole("link", { name: "Start an application" })).toHaveAttribute("href", HUB_URL);
    await expect(page.getByRole("link", { name: "See the admissions page" })).toHaveAttribute("href", "/admissions");
    await expect(page.getByRole("link", { name: /X \(@naalya_schools\)/ })).toHaveAttribute("href", "https://x.com/naalya_schools");
    await expect(page.locator('a[href^="tel:"], a[href^="mailto:"]')).toHaveCount(0);
    await expect(page.getByText("will be shown here once the school confirms them")).toBeVisible();
  });

  test("admissions page Apply link reaches the Education Hub and Make an enquiry reaches the school page", async ({ page }) => {
    await page.goto("/admissions");
    // Each link appears twice (hero on desktop, sticky bar on phones). Check the one the user can see.
    await expect(page.locator(`a[href="${HUB_URL}"]`).filter({ visible: true }).first()).toBeVisible();
    await expect(page.locator(`a[href="${SCHOOL_ENQUIRY_URL}"]`).filter({ visible: true }).first()).toBeVisible();
    await expect(page.locator("form")).toHaveCount(0);
  });

  test("API refuses with 503, returns no reference and stores nothing", async ({ page }) => {
    const data = syntheticEnquiry();
    const response = await page.request.post("/api/enquiry", {
      headers: { "content-type": "application/json", "x-real-ip": uniqueTestIp() },
      data: {
        parentName: data.parentName,
        phone: data.phone,
        desiredLevel: data.desiredLevel,
        learnerAge: data.learnerAge,
        preferredIntake: data.preferredIntake,
        consent: true,
      },
    });
    expect(response.status()).toBe(503);
    const body = await response.json();
    expect(body.code).toBe("DISABLED");
    expect(body.reference).toBeUndefined();
    expect(await recordsWithDigits(data.digits)).toHaveLength(0);
  });

  test("no horizontal scrolling at this viewport", async ({ page }) => {
    await page.goto("/admissions/enquiry");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("production build on a slow connection", () => {
  test("fallback page loads on Fast 3G and records its transfer size", async ({ page }, testInfo) => {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 562.5,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      connectionType: "cellular3g",
    });
    const started = Date.now();
    await page.goto("/admissions/enquiry", { waitUntil: "load", timeout: 180_000 });
    const loadMs = Date.now() - started;
    const bytes = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      return (nav?.transferSize ?? 0) + resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
    });
    testInfo.annotations.push({ type: "fast-3g-load-ms", description: String(loadMs) });
    testInfo.annotations.push({ type: "fast-3g-transfer-bytes", description: String(bytes) });
    console.log(`[fast-3g closed] ${testInfo.project.name}: load ${loadMs} ms, transfer ${bytes} bytes`);
    await expect(page.getByRole("heading", { name: "Online enquiries aren’t open yet" })).toBeVisible();
    // Planning target from the implementation guide: about 1.5 MB or less for the initial load.
    expect(bytes).toBeLessThanOrEqual(1.5 * 1024 * 1024);
  });
});
