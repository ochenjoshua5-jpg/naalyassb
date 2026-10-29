import { expect, test, type Page } from "@playwright/test";
import { syntheticEnquiry, uniqueTestIp, type SyntheticEnquiry } from "./support/synthetic";
import { recordsWithDigits, setOutage } from "./support/test-store";

/**
 * Backend-failure tests. The test server (port 3001, ENQUIRY_STORE=test-file) is put into a simulated
 * outage by creating the outage flag file; the real store then throws on every insert. The form must
 * show a warm error, the fallback routes, and never a success. Network-level failures (abort, 502)
 * are simulated with Playwright route interception.
 */

const HUB_URL = "https://hub.naalyaschools.ac.ug/naalya-secondary-school/apply";

test.beforeEach(async ({ context }) => {
  await context.setExtraHTTPHeaders({ "x-real-ip": uniqueTestIp() });
  await setOutage(true);
});

test.afterEach(async () => {
  await setOutage(false);
});

async function openAndFill(page: Page, data: SyntheticEnquiry) {
  await page.goto("/admissions/enquiry");
  await page.getByLabel(/Parent or guardian/).fill(data.parentName);
  await page.getByLabel(/^Phone number/).fill(data.phone);
  await page.getByLabel(/^Email address/).fill(data.email);
  await page.getByRole("radio", { name: data.desiredLevel }).click();
  await page.getByLabel(/Learner.s age/).fill(data.learnerAge);
  await page.getByRole("radio", { name: "Next available intake" }).click();
  await page.getByLabel(/Your question/).fill(data.question);
  await page.getByRole("checkbox", { name: /I have read the privacy notice/ }).click();
}

test.describe("backend unavailable", () => {
  test("save failure shows a warm error, never a success, and keeps the answers", async ({ page }) => {
    const data = syntheticEnquiry();
    await openAndFill(page, data);
    await page.getByRole("button", { name: "Send enquiry" }).click();

    const alert = page.getByRole("alert").filter({ hasText: "We couldn’t save your enquiry just now" });
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("so it has not been received");
    await expect(page.getByRole("heading", { name: "Thank you. Your enquiry has been received." })).toHaveCount(0);
    await expect(page.locator("dd.font-mono")).toHaveCount(0); // no reference is issued
    await expect(page.locator("[data-sonner-toast]").first()).toContainText("Your enquiry has not been sent");

    // The parent does not have to retype anything.
    await expect(page.getByLabel(/Parent or guardian/)).toHaveValue(data.parentName);
    await expect(page.getByLabel(/^Phone number/)).toHaveValue(data.phone);
    await expect(page.getByRole("button", { name: "Send enquiry" })).toBeEnabled();

    // Nothing reached storage.
    expect(await recordsWithDigits(data.digits)).toHaveLength(0);
  });

  test("error state offers the verified fallback routes", async ({ page }) => {
    const data = syntheticEnquiry();
    await openAndFill(page, data);
    await page.getByRole("button", { name: "Send enquiry" }).click();
    const alert = page.getByRole("alert").filter({ hasText: "We couldn’t save your enquiry" });
    await expect(alert).toBeVisible();
    await expect(alert.getByRole("link", { name: /Education Hub/ })).toHaveAttribute("href", HUB_URL);
    await expect(alert.getByRole("link", { name: "admissions page" })).toHaveAttribute("href", "/admissions");
    // The same verified Hub link is also present beneath the form.
    await expect(page.getByRole("link", { name: /Start an application on the Education Hub/ })).toHaveAttribute("href", HUB_URL);
  });

  test("API returns 503 with the warm message and no reference", async ({ page }) => {
    const response = await page.request.post("/api/enquiry", {
      headers: { "content-type": "application/json", "x-real-ip": uniqueTestIp() },
      data: {
        parentName: "Akello Atim",
        phone: "0700 000 001",
        desiredLevel: "O-Level",
        learnerAge: "14",
        preferredIntake: "not-sure",
        consent: true,
      },
    });
    expect(response.status()).toBe(503);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.reference).toBeUndefined();
    expect(body.message).toContain("has not been received");
  });

  test("network abort shows the connection message and keeps answers", async ({ page }) => {
    const data = syntheticEnquiry();
    await openAndFill(page, data);
    await page.route("**/api/enquiry", (route) => route.abort("internetdisconnected"));
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "We couldn’t reach the enquiry service" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Thank you. Your enquiry has been received." })).toHaveCount(0);
    await expect(page.getByLabel(/Parent or guardian/)).toHaveValue(data.parentName);
    await page.unroute("**/api/enquiry");
  });

  test("gateway 502 shows the warm message, not a success", async ({ page }) => {
    const data = syntheticEnquiry();
    await openAndFill(page, data);
    await page.route("**/api/enquiry", (route) => route.fulfill({ status: 502, contentType: "text/html", body: "<h1>Bad gateway</h1>" }));
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "We couldn’t save your enquiry just now" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Thank you. Your enquiry has been received." })).toHaveCount(0);
    await page.unroute("**/api/enquiry");
  });

  test("Apply Now fallback still points at the school-confirmed Education Hub", async ({ page }) => {
    await page.goto("/admissions/enquiry");
    await expect(page.getByRole("link", { name: /Education Hub/ }).first()).toHaveAttribute("href", HUB_URL);
  });
});
