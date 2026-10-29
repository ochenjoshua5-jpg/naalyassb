import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { formatEat } from "../lib/enquiry/log";
import { PRIVACY_NOTICE_VERSION } from "../lib/enquiry/schema";
import type { EnquiryRecord } from "../lib/enquiry/store";
import { deleteRecordsWithDigits, recordsWithDigits } from "./support/test-store";
import { syntheticEnquiry, uniqueTestIp, type SyntheticEnquiry } from "./support/synthetic";

/**
 * Form in the OPEN test mode (server on port 3001, ENQUIRY_STORE=test-file).
 * All data is synthetic. Every record created here is deleted in afterEach.
 */

const EXPECTED_KEYS = [
  "consentGiven", "consentNoticeVersion", "createdAt", "desiredLevel", "email", "id", "learnerAge",
  "parentName", "phone", "preferredIntake", "question", "reference", "source", "status",
].sort();

let currentDigits: string[] = [];

test.beforeEach(async ({ context }) => {
  // Each test gets its own address so the in-memory rate limiter never mixes tests.
  await context.setExtraHTTPHeaders({ "x-real-ip": uniqueTestIp() });
  currentDigits = [];
});

test.afterEach(async () => {
  for (const digits of currentDigits) await deleteRecordsWithDigits(digits);
});

function track(data: SyntheticEnquiry) {
  currentDigits.push(data.digits);
  return data;
}

async function openForm(page: Page) {
  await page.goto("/admissions/enquiry");
  await expect(page.getByRole("heading", { name: "Make an enquiry", level: 2 })).toBeVisible();
}

async function fillForm(page: Page, data: SyntheticEnquiry) {
  await page.getByLabel(/Parent or guardian/).fill(data.parentName);
  await page.getByLabel(/^Phone number/).fill(data.phone);
  await page.getByLabel(/^Email address/).fill(data.email);
  await page.getByRole("radio", { name: data.desiredLevel }).click();
  await page.getByLabel(/Learner.s age/).fill(data.learnerAge);
  await page
    .getByRole("radio", { name: data.preferredIntake === "next-available" ? "Next available intake" : "Not sure yet" })
    .click();
  await page.getByLabel(/Your question/).fill(data.question);
  await page.getByRole("checkbox", { name: /I have read the privacy notice/ }).click();
}

test.describe("enquiry form, open test mode", () => {
  test("form shows labelled controls, verified routes and no unapproved contact details", async ({ page }) => {
    await openForm(page);
    await expect(page.getByLabel(/Parent or guardian/)).toBeVisible();
    await expect(page.getByLabel(/^Phone number/)).toBeVisible();
    await expect(page.getByLabel(/^Email address/)).toBeVisible();
    // HeadlessUI names each option group through its legend (fieldset); the radios inside are real radio buttons.
    await expect(page.getByRole("group", { name: /Level of interest/ })).toBeVisible();
    await expect(page.getByRole("group", { name: /Intake you have in mind/ })).toBeVisible();
    await expect(page.getByRole("radio", { name: "O-Level" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Next available intake" })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: /I have read the privacy notice/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Send enquiry" })).toBeEnabled();
    // Unverified school contact details must not appear (lib/site.ts keeps phone and email null).
    await expect(page.locator('a[href^="tel:"], a[href^="mailto:"]')).toHaveCount(0);
    await expect(page.getByText("+256 772 345 678")).toHaveCount(0);
    await expect(page.getByText("admin@naalyaschools.ac.ug")).toHaveCount(0);
  });

  test("empty submit shows warm, specific messages and sends nothing", async ({ page }) => {
    await openForm(page);
    let posted = 0;
    page.on("request", (req) => {
      if (req.url().includes("/api/enquiry") && req.method() === "POST") posted += 1;
    });
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByText("Please enter the parent or guardian’s name so we know who to reply to.").first()).toBeVisible();
    await expect(page.getByText("Please enter a phone number so the admissions team can call or text you.").first()).toBeVisible();
    await expect(page.getByText("Please choose O-Level or A-Level.").first()).toBeVisible();
    await expect(page.getByText("Please tick the box to confirm you have read the privacy notice.").first()).toBeVisible();
    await expect(page.getByLabel(/Parent or guardian/)).toHaveAttribute("aria-invalid", "true");
    expect(posted).toBe(0);
  });

  test("invalid name, phone, email, age and sensitive question each get a helpful message", async ({ page }) => {
    await openForm(page);
    const data = track(syntheticEnquiry());
    await fillForm(page, data);
    await page.getByLabel(/Parent or guardian/).fill("N");
    await page.getByLabel(/^Phone number/).fill("12345");
    await page.getByLabel(/^Email address/).fill("nakato@example");
    await page.getByLabel(/Learner.s age/).fill("42");
    await page.getByLabel(/Your question/).fill("My NIN is CM1234567890AB please note it");
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByText(/so we know who to reply to/).first()).toBeVisible();
    await expect(page.getByText(/doesn’t look quite right\. Please enter a Ugandan number/).first()).toBeVisible();
    await expect(page.getByText(/That email address doesn’t look quite right/).first()).toBeVisible();
    await expect(page.getByText(/aged about 10 to 25/).first()).toBeVisible();
    await expect(page.getByText(/leave out ID numbers and medical details/).first()).toBeVisible();
  });

  test("consent must be ticked; nothing is sent without it", async ({ page }) => {
    await openForm(page);
    const data = track(syntheticEnquiry());
    await fillForm(page, data);
    await page.getByRole("checkbox", { name: /I have read the privacy notice/ }).click(); // untick
    let posted = 0;
    page.on("request", (req) => {
      if (req.url().includes("/api/enquiry") && req.method() === "POST") posted += 1;
    });
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByText(/We can’t send your enquiry without it/).first()).toBeVisible();
    expect(posted).toBe(0);
    expect(await recordsWithDigits(data.digits)).toHaveLength(0);
  });

  test("valid synthetic enquiry: success only after storage, normalised phone, EAT timestamp, minimal fields", async ({ page }) => {
    await openForm(page);
    const data = track(syntheticEnquiry());
    await fillForm(page, data);
    await page.getByRole("button", { name: "Send enquiry" }).click();

    const success = page.getByRole("heading", { name: "Thank you. Your enquiry has been received." });
    await expect(success).toBeVisible();
    const reference = (await page.locator("dd.font-mono").innerText()).trim();
    expect(reference).toMatch(/^ENQ-\d{8}-[0-9A-F]{8}$/);
    await expect(page.locator("[data-sonner-toast]").first()).toContainText("Thank you. Your enquiry has been received.");

    const records = await recordsWithDigits(data.digits);
    expect(records).toHaveLength(1);
    const record: EnquiryRecord = records[0];
    expect(record.reference).toBe(reference);
    expect(record.phone).toBe(`+256${data.digits}`); // spaces and leading 0 normalised
    expect(record.parentName).toBe(data.parentName);
    expect(record.email).toBe(data.email.toLowerCase());
    expect(record.desiredLevel).toBe(data.desiredLevel);
    expect(record.learnerAge).toBe(Number(data.learnerAge));
    expect(record.consentGiven).toBe(true);
    expect(record.consentNoticeVersion).toBe(PRIVACY_NOTICE_VERSION);
    expect(record.status).toBe("new");
    expect(record.source).toBe("test");
    expect(Object.keys(record).sort()).toEqual(EXPECTED_KEYS); // data minimisation: nothing extra is stored

    // Timestamps: stored in UTC; shown in EAT (UTC+3). Check both independently.
    const created = new Date(record.createdAt);
    expect(Number.isNaN(created.getTime())).toBe(false);
    const shownEat = (await page.locator("dd").nth(1).innerText()).trim();
    expect(shownEat).toMatch(/EAT$/);
    expect(shownEat).toBe(formatEat(created));
    const expectedHour = String((created.getUTCHours() + 3) % 24).padStart(2, "0");
    expect(shownEat).toContain(`${expectedHour}:`);
  });

  test("honeypot filled is refused and stores nothing", async ({ page }) => {
    const data = track(syntheticEnquiry());
    const response = await page.request.post("/api/enquiry", {
      headers: { "content-type": "application/json", "x-real-ip": uniqueTestIp() },
      data: {
        parentName: data.parentName,
        phone: data.phone,
        desiredLevel: data.desiredLevel,
        learnerAge: data.learnerAge,
        preferredIntake: data.preferredIntake,
        consent: true,
        website: "https://spam.example.test",
      },
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).reference).toBeUndefined();
    expect(await recordsWithDigits(data.digits)).toHaveLength(0);
  });

  test("API rejects non-JSON, wrong method and oversize bodies without storing", async ({ page }) => {
    const plain = await page.request.post("/api/enquiry", {
      headers: { "content-type": "text/plain", "x-real-ip": uniqueTestIp() },
      data: "hello",
    });
    expect(plain.status()).toBe(415);

    const broken = await page.request.post("/api/enquiry", {
      headers: { "content-type": "application/json", "x-real-ip": uniqueTestIp() },
      data: "{not json",
    });
    expect(broken.status()).toBe(400);

    const huge = await page.request.post("/api/enquiry", {
      headers: { "content-type": "application/json", "x-real-ip": uniqueTestIp() },
      data: JSON.stringify({ question: "x".repeat(9000) }),
    });
    expect(huge.status()).toBe(413);

    const get = await page.request.get("/api/enquiry");
    expect(get.status()).toBe(405);
  });

  test("rate limit: 3 enquiries per IP per hour; the 4th is refused warmly", async ({ page }) => {
    const ip = uniqueTestIp();
    const headers = { "content-type": "application/json", "x-real-ip": ip };
    const made: string[] = [];
    for (let i = 0; i < 3; i++) {
      const data = track(syntheticEnquiry());
      const response = await page.request.post("/api/enquiry", {
        headers,
        data: {
          parentName: data.parentName,
          phone: data.phone,
          desiredLevel: data.desiredLevel,
          learnerAge: data.learnerAge,
          preferredIntake: data.preferredIntake,
          consent: true,
        },
      });
      expect(response.status(), `enquiry ${i + 1}`).toBe(201);
      made.push(data.digits);
    }
    const blocked = track(syntheticEnquiry());
    const refused = await page.request.post("/api/enquiry", {
      headers,
      data: {
        parentName: blocked.parentName,
        phone: blocked.phone,
        desiredLevel: blocked.desiredLevel,
        learnerAge: blocked.learnerAge,
        preferredIntake: blocked.preferredIntake,
        consent: true,
      },
    });
    expect(refused.status()).toBe(429);
    expect((await refused.json()).message).toContain("several enquiries");
    expect(await recordsWithDigits(blocked.digits)).toHaveLength(0);
  });

  test("loading state shows while sending, then success", async ({ page }) => {
    await openForm(page);
    const data = track(syntheticEnquiry());
    await fillForm(page, data);
    await page.route("**/api/enquiry", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.continue();
    });
    await page.getByRole("button", { name: "Send enquiry" }).click();
    const busy = page.getByRole("button", { name: "Sending your enquiry…" });
    await expect(busy).toBeVisible();
    await expect(busy).toHaveAttribute("aria-busy", "true");
    await expect(busy).toBeDisabled();
    await expect(page.getByRole("heading", { name: "Thank you. Your enquiry has been received." })).toBeVisible();
    await page.unroute("**/api/enquiry");
  });

  test("keyboard: the level radio group responds to arrow keys", async ({ page }) => {
    await openForm(page);
    await page.getByRole("radio", { name: "O-Level" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "A-Level" })).toHaveAttribute("aria-checked", "true");
  });

  test("accessibility scan finds no serious or critical violations on the form", async ({ page }) => {
    // Measure contrast on settled content: the site fades sections in unless reduced motion is requested.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openForm(page);
    // Reduced motion removes movement but not fades, so wait until the hero's effective opacity reaches 1
    // (the product of opacity up the ancestor chain). Colours measured mid-fade are not the real colours.
    await expect
      .poll(() =>
        page.evaluate(() => {
          let effective = 1;
          let el: Element | null = document.getElementById("enquiry-title");
          while (el) {
            effective *= parseFloat(getComputedStyle(el).opacity);
            el = el.parentElement;
          }
          return Math.round(effective * 100) / 100;
        }),
      )
      .toBe(1);
    const results = await new AxeBuilder({ page }).include("main").analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.html.slice(0, 160)}`))).toEqual([]);
  });

  test("no horizontal scrolling at this viewport", async ({ page }) => {
    await openForm(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("slow connection (Fast 3G emulation)", () => {
  test("form still works on a Fast 3G profile (development server; page weight is measured elsewhere)", async ({ page }) => {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Network.enable");
    // Fast 3G profile: 562.5 ms latency, 1.6 Mbps down, 750 kbps up.
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 562.5,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      connectionType: "cellular3g",
    });
    await page.goto("/admissions/enquiry", { waitUntil: "load", timeout: 180_000 });
    const data = track(syntheticEnquiry());
    await fillForm(page, data);
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByRole("heading", { name: "Thank you. Your enquiry has been received." })).toBeVisible({ timeout: 90_000 });
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  });
});
