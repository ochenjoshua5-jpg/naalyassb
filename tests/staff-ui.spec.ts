import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { CSV_HEADERS } from "../lib/staff/csv";
import { removeTestStore } from "./support/test-store";
import { ADMIN, ADMISSIONS, TEACHER, allRecords, buildRecord, seedRecords, setStaffOutage, staffHeaders } from "./support/staff";

/**
 * Staff UI in the TEST mode (port 3001, STAFF_DASHBOARD=test). Runs at 375 px (phone) and 1280 px (desktop).
 * Every test starts from the same synthetic data set; all names, phones and emails are fake.
 */

const SEED = {
  grace: "00000000-0000-4000-8000-0000000000a1",
  peter: "00000000-0000-4000-8000-0000000000a2",
  mary: "00000000-0000-4000-8000-0000000000a3",
  hostile: "00000000-0000-4000-8000-0000000000a4",
  sarah: "00000000-0000-4000-8000-0000000000a5",
};

function seedSet() {
  const named = [
    buildRecord({ id: SEED.grace, reference: "ENQ-20261026-AAAA0001", parentName: "Grace Nansubuga", phone: "+256771000001", desiredLevel: "O-Level", ageDays: 3, question: "When does the next term start?" }),
    buildRecord({ id: SEED.peter, reference: "ENQ-20261029-AAAA0002", parentName: "Peter Okello", phone: "+256771000002", desiredLevel: "A-Level", ageDays: 0.01, question: "Do you take boarding learners?" }),
    buildRecord({ id: SEED.mary, reference: "ENQ-20261024-AAAA0003", parentName: "Mary Achieng", phone: "+256771000003", desiredLevel: "O-Level", ageDays: 0.4, status: "contacted", contactedAt: new Date(Date.now() - 4 * 86_400_000).toISOString(), question: "Thank you for the call." }),
    buildRecord({ id: SEED.hostile, reference: "ENQ-20261029-AAAA0004", parentName: "Hostile <img src=x onerror=alert(1)>", phone: "+256771000004", desiredLevel: "O-Level", ageDays: 0.5, question: '=HYPERLINK("https://example.test","click")' }),
    buildRecord({ id: SEED.sarah, reference: "ENQ-20261029-AAAA0005", parentName: "Sarah Namatovu", phone: "+256771000005", desiredLevel: "A-Level", ageDays: 0.2, email: "sarah.test@example.test", question: "What are the fees?" }),
  ];
  const fillers = Array.from({ length: 20 }, (_, index) =>
    buildRecord({
      parentName: `Filler Parent ${String(index + 1).padStart(2, "0")}`,
      phone: `+25677200${String(index + 1).padStart(4, "0")}`,
      ageDays: 0.9 - index * 0.01,
    }),
  );
  return [...named, ...fillers];
}

test.beforeEach(async ({ context }) => {
  await removeTestStore();
  await seedRecords(seedSet());
  await context.setExtraHTTPHeaders({});
});

test.afterEach(async () => {
  await setStaffOutage(false);
});

function isDesktop(page: Page) {
  return (page.viewportSize()?.width ?? 0) >= 1024;
}

async function openEnquiries(page: Page, asRole: Record<string, string> = ADMISSIONS) {
  await page.context().setExtraHTTPHeaders(asRole);
  await page.goto("/staff/enquiries");
  await expect(page.getByRole("heading", { name: "Enquiries", level: 1 })).toBeVisible();
  await expect(page.getByText(/in total\./)).toBeVisible();
}

async function showTable(page: Page) {
  const toggle = page.getByRole("button", { name: "Table", exact: true });
  if (await toggle.isVisible()) await toggle.click();
}

async function apiStatus(page: Page, name: string): Promise<string | undefined> {
  const response = await page.request.get("/api/staff/enquiries", { headers: ADMISSIONS });
  const body = await response.json();
  return body.items.find((item: { parentName: string }) => item.parentName === name)?.status;
}

// ---------------------------------------------------------------- sign-in and access

test.describe("sign-in and access", () => {
  test("a signed-out visitor is sent to the styled sign-in page, and sees no data", async ({ page }) => {
    await page.context().setExtraHTTPHeaders({});
    await page.goto("/staff/dashboard");
    await expect(page).toHaveURL(/\/staff\/sign-in/);
    await expect(page.getByText("not connected in this preview yet", { exact: false })).toBeVisible();
    await expect(page.getByText("Peter Okello")).toHaveCount(0);
  });

  test("a teacher account sees the no-access message and no enquiry data", async ({ page }) => {
    await page.context().setExtraHTTPHeaders(TEACHER);
    await page.goto("/staff/enquiries");
    await expect(page.getByText("This account does not have staff access.")).toBeVisible();
    const body = await page.locator("body").innerText();
    expect(body).not.toContain("Peter Okello");
    expect(body).not.toContain("Grace Nansubuga");
  });

  test("an account with an unknown role is refused the same way", async ({ page }) => {
    await page.context().setExtraHTTPHeaders(staffHeaders("ADMIN"));
    await page.goto("/staff/dashboard");
    await expect(page.getByText("This account does not have staff access.")).toBeVisible();
    expect(await page.locator("body").innerText()).not.toContain("Peter Okello");
  });

  test("admissions cannot see delete controls; admin can", async ({ page }) => {
    await openEnquiries(page, ADMISSIONS);
    await showTable(page);
    await expect(page.getByLabel(/Delete enquiry from/)).toHaveCount(0);
    await page.context().setExtraHTTPHeaders(ADMIN);
    await page.reload();
    await showTable(page);
    if (isDesktop(page)) await expect(page.getByLabel(/Delete enquiry from/).first()).toBeAttached();
  });

  test("the staff guide explains the shortcut in plain English", async ({ page }) => {
    await openEnquiries(page);
    await page.goto("/staff/guide");
    await expect(page.getByRole("heading", { name: "Staff guide", level: 1 })).toBeVisible();
    await expect(page.getByText("Press Ctrl K (or ⌘ K on a Mac) to search from anywhere.")).toBeVisible();
  });
});

// ---------------------------------------------------------------- enquiries

test.describe("enquiries", () => {
  test("the list shows the required columns and the overdue alert", async ({ page }) => {
    await openEnquiries(page);
    await showTable(page);
    // Level is hidden on phones (md and up only), so it is checked on wider screens.
    const headings = isDesktop(page) ? ["Parent name", "Phone", "Level", "Status", "Submitted (EAT)"] : ["Parent name", "Phone", "Status"];
    for (const heading of headings) {
      await expect(page.getByRole("columnheader", { name: heading })).toBeVisible();
    }
    await expect(page.getByText(/not been contacted in over 24 hours/)).toBeVisible();
    await expect(page.getByText("Showing all 25 enquiries.")).toBeVisible();
  });

  test("search by name, by phone with a leading 0, and no match", async ({ page }) => {
    await openEnquiries(page);
    await showTable(page);
    const search = page.getByRole("searchbox");
    await search.fill("namatovu");
    await expect(page.getByText("Showing 1 of 25 enquiries.")).toBeVisible();
    await search.fill("0771 000 002");
    await expect(page.getByText("Showing 1 of 25 enquiries.")).toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: "Peter Okello" })).toBeVisible();
    await search.fill("zzzz-no-such-parent");
    await expect(page.getByText("No enquiries match these filters.")).toBeVisible();
  });

  test("filter by status shows only New enquiries", async ({ page }) => {
    await openEnquiries(page);
    await showTable(page);
    await page.getByRole("combobox", { name: "Status", exact: true }).selectOption("new");
    await expect(page.getByText("Showing 24 of 25 enquiries.")).toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: "Mary Achieng" })).toHaveCount(0);
  });

  test("the table pages 20 at a time", async ({ page }) => {
    await openEnquiries(page);
    await showTable(page);
    await expect(page.getByText("Showing 1–20 of 25 enquiries")).toBeVisible();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByText("Showing 21–25 of 25 enquiries")).toBeVisible();
  });

  test("inline status change saves to the server", async ({ page }) => {
    await openEnquiries(page);
    await showTable(page);
    await page.getByRole("button", { name: "Change status for Sarah Namatovu" }).click();
    await page.getByRole("combobox", { name: "Change status for Sarah Namatovu" }).selectOption("visit-scheduled");
    await expect(page.getByRole("row").filter({ hasText: "Sarah Namatovu" }).getByText("Visit scheduled")).toBeVisible();
    await expect.poll(() => apiStatus(page, "Sarah Namatovu")).toBe("visit-scheduled");
  });

  test("bulk Mark as Contacted changes only New enquiries and reports the rest", async ({ page }) => {
    await openEnquiries(page);
    await showTable(page);
    await page.getByRole("checkbox", { name: "Select Peter Okello" }).check();
    await page.getByRole("checkbox", { name: "Select Mary Achieng" }).check();
    await page.getByRole("button", { name: "Mark as Contacted" }).click();
    await expect(page.getByText("1 enquiry marked as Contacted. 1 already past New, so left as they are.")).toBeVisible();
    await expect.poll(() => apiStatus(page, "Peter Okello")).toBe("contacted");
    await expect.poll(() => apiStatus(page, "Mary Achieng")).toBe("contacted");
    const mary = (await allRecords()).find((record) => record.id === SEED.mary);
    expect(mary?.contactedAt).not.toBeNull();
  });

  test("CSV export has the agreed columns, the filtered rows, and neutralises formulas", async ({ page }) => {
    await openEnquiries(page);
    await showTable(page);
    await page.getByRole("combobox", { name: "Status", exact: true }).selectOption("new");
    await expect(page.getByText("Showing 24 of 25 enquiries.")).toBeVisible();
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Export to CSV/ }).click()]);
    expect(download.suggestedFilename()).toMatch(/^naalya-enquiries-\d{4}-\d{2}-\d{2}\.csv$/);
    // The file starts with a UTF-8 byte-order mark so Excel reads names correctly; check the text after it.
    const csv = (await readFile(await download.path(), "utf8")).replace(/^\uFEFF/, "");
    const header = csv.split("\n")[0].replace(/\r$/, "");
    expect(header).toBe(CSV_HEADERS.map((h) => `"${h}"`).join(","));
    const dataRows = csv.split("\n").filter((line) => line.startsWith('"ENQ-'));
    expect(dataRows.length).toBe(24);
    expect(csv).not.toContain("Mary Achieng");
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).not.toMatch(/^"?=/m);
  });

  test("the name with markup is shown as plain text and runs no script", async ({ page }) => {
    let dialogs = 0;
    page.on("dialog", () => {
      dialogs += 1;
    });
    await openEnquiries(page);
    await showTable(page);
    await expect(page.getByText("Hostile <img src=x onerror=alert(1)>").first()).toBeVisible();
    await expect(page.locator('img[src="x"]')).toHaveCount(0);
    expect(dialogs).toBe(0);
  });

  test("a failed status change is rolled back, and Retry saves it", async ({ page }) => {
    await openEnquiries(page);
    await showTable(page);
    await setStaffOutage(true);
    await page.getByRole("button", { name: "Change status for Peter Okello" }).click();
    await page.getByRole("combobox", { name: "Change status for Peter Okello" }).selectOption("contacted");
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: "Peter Okello" }).getByText("New", { exact: true })).toBeVisible();
    await setStaffOutage(false);
    await page.getByRole("button", { name: "Retry" }).click();
    await expect.poll(() => apiStatus(page, "Peter Okello")).toBe("contacted");
  });

  test("admin delete asks first, Keep it is the default, and Delete removes the record", async ({ page }) => {
    await openEnquiries(page, ADMIN);
    await showTable(page);
    await page.getByRole("button", { name: "Delete enquiry from Filler Parent 20" }).click();
    const keep = page.getByRole("button", { name: "Keep it" });
    await expect(page.getByRole("heading", { name: "Delete this enquiry?" })).toBeVisible();
    await expect(keep).toBeFocused();
    await keep.click();
    await expect.poll(() => apiStatus(page, "Filler Parent 20")).toBe("new");
    await page.getByRole("button", { name: "Delete enquiry from Filler Parent 20" }).click();
    await page.getByRole("button", { name: "Delete enquiry", exact: true }).click();
    await expect.poll(() => apiStatus(page, "Filler Parent 20")).toBeUndefined();
  });

  test("the palette finds an enquiry by name and opens it", async ({ page }) => {
    await openEnquiries(page);
    await page.keyboard.press("Control+k");
    const input = page.getByPlaceholder("Search a name, phone, enquiry or page…");
    await expect(input).toBeVisible();
    await input.fill("Peter");
    await page.getByRole("option", { name: /Peter Okello/ }).click();
    await expect(page).toHaveURL(/\/staff\/enquiries\?open=/);
    await expect(page.getByText("Do you take boarding learners?")).toBeVisible();
  });

  test("the palette opens the staff guide from the keyboard", async ({ page }) => {
    await openEnquiries(page);
    await page.keyboard.press("Control+k");
    await page.getByPlaceholder("Search a name, phone, enquiry or page…").fill("staff guide");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/staff\/guide/);
  });

  test("a phone-sized screen gets the table, not the board, and does not scroll sideways", async ({ page }) => {
    test.skip(isDesktop(page), "phone layout only");
    await openEnquiries(page);
    await expect(page.getByRole("button", { name: "Board", exact: true })).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe("board (desktop)", () => {
  test("the board is the default and a Move to change saves", async ({ page }) => {
    test.skip(!isDesktop(page), "desktop only");
    await openEnquiries(page);
    await expect(page.getByRole("region", { name: /New column/ })).toBeVisible();
    await page.getByRole("listitem").filter({ hasText: "Peter Okello" }).getByLabel("Move to").selectOption("visit-scheduled");
    await expect(page.getByRole("region", { name: /Visit scheduled column/ }).getByText("Peter Okello")).toBeVisible();
    await expect.poll(() => apiStatus(page, "Peter Okello")).toBe("visit-scheduled");
  });

  test("keyboard drag moves a card to the next column and saves", async ({ page }) => {
    test.skip(!isDesktop(page), "desktop only");
    await openEnquiries(page);
    const handle = page.getByRole("button", { name: /Drag Grace Nansubuga/ });
    await handle.focus();
    await page.keyboard.press("Space");
    // Keyboard drags move in small steps (about 25 px a press), so keep pressing until the
    // announcement names the Contacted column, then drop. This is the path a keyboard user takes.
    const announced = page.locator('[aria-live]').filter({ hasText: "droppable area contacted" });
    for (let press = 0; press < 40 && (await announced.count()) === 0; press += 1) {
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(50);
    }
    await page.keyboard.press("Space");
    await expect(page.getByRole("region", { name: /Contacted column/ }).getByText("Grace Nansubuga")).toBeVisible();
    await expect.poll(() => apiStatus(page, "Grace Nansubuga")).toBe("contacted");
  });
});

// ---------------------------------------------------------------- live arrival and notifications

test.describe("live updates", () => {
  test("a new enquiry appears without a reload, within 30 seconds, and the bell counts it", async ({ page }) => {
    await openEnquiries(page);
    await expect(page.getByRole("button", { name: "Notifications, none new" })).toBeVisible();
    await seedRecords([buildRecord({ parentName: "Live Arrival Test", phone: "+256771999999", question: "Live test question" })]);
    await expect(page.getByText("Live Arrival Test").first()).toBeVisible({ timeout: 40_000 });
    await expect(page.getByRole("button", { name: "Notifications, 1 new" })).toBeVisible();
  });
});

// ---------------------------------------------------------------- content

test.describe("news and notices", () => {
  test("the Publish and Schedule buttons are off, and a draft is not on the public News page", async ({ page }) => {
    await openEnquiries(page);
    await page.goto("/staff/content");
    await expect(page.getByRole("button", { name: "Publish", exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Schedule", exact: true })).toBeDisabled();
    await page.getByLabel("Headline").fill("Draft headline only on this device");
    await page.getByRole("button", { name: "Save draft on this device" }).click();
    await expect(page.getByText(/Saved on this device at/)).toBeVisible();
    const news = await page.request.get("/news");
    expect(await news.text()).not.toContain("Draft headline only on this device");
  });

  test("article editing: formatting, a safe link, a safe picture, and the rejections", async ({ page }) => {
    await openEnquiries(page);
    await page.goto("/staff/content");
    await page.getByLabel("Headline").fill("Parents’ meeting date");
    await page.locator(".ProseMirror").click();
    await page.keyboard.type("The parents’ meeting is on a date the school will confirm.");

    await page.getByRole("button", { name: "Link", exact: true }).click();
    await page.getByLabel(/Web address/).fill("javascript:alert(1)");
    await page.getByRole("button", { name: "Add link" }).click();
    await expect(page.locator('p[role="alert"]')).toContainText("starts with https://");
    await page.getByLabel(/Web address/).fill("https://naalyaschools.ac.ug/admissions");
    await page.getByRole("button", { name: "Add link" }).click();
    await expect(page.locator('.ProseMirror a[href="https://naalyaschools.ac.ug/admissions"]')).toHaveCount(1);

    await page.getByRole("button", { name: "Insert image", exact: true }).click();
    await page.getByLabel(/Image web address/).fill("http://example.test/photo.jpg");
    await page.getByLabel(/Describe the picture/).fill("Students in the lab");
    await page.getByRole("button", { name: "Insert picture" }).click();
    await expect(page.locator('p[role="alert"]')).toContainText("must start with https://");
    await page.getByLabel(/Image web address/).fill("https://example.test/photo.jpg");
    await page.getByLabel(/Describe the picture/).fill("hi");
    await page.getByRole("button", { name: "Insert picture" }).click();
    await expect(page.locator('p[role="alert"]')).toContainText("at least 5");
    await page.getByLabel(/Describe the picture/).fill("Students working in the science lab");
    await page.getByRole("button", { name: "Insert picture" }).click();
    await expect(page.locator('.ProseMirror img[src="https://example.test/photo.jpg"][alt="Students working in the science lab"]')).toHaveCount(1);

    await page.getByRole("button", { name: "Preview", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Parents’ meeting date", level: 2 })).toBeVisible();
    await page.getByRole("button", { name: /Back to editing/ }).click();
    await expect(page.getByRole("toolbar", { name: "Formatting" })).toBeVisible();
  });

  test("autosave keeps the draft on this device every 30 seconds, and it comes back after a reload", async ({ page }) => {
    test.setTimeout(90_000);
    await openEnquiries(page);
    await page.goto("/staff/content");
    await page.getByLabel("Headline").fill("Autosave check headline");
    await page.locator(".ProseMirror").click();
    await page.keyboard.type("Autosave body text.");
    await expect(page.getByText(/Saved on this device at/)).toBeVisible({ timeout: 40_000 });
    await page.reload();
    await expect(page.getByLabel("Headline")).toHaveValue("Autosave check headline");
    await expect(page.locator(".ProseMirror")).toContainText("Autosave body text.");
  });

  test("the character counter warns when an article is too long", async ({ page }) => {
    await openEnquiries(page);
    await page.goto("/staff/content");
    await page.locator(".ProseMirror").click();
    await page.keyboard.insertText("a".repeat(2_050));
    await expect(page.getByText(/please shorten the article/)).toBeVisible();
  });
});

// ---------------------------------------------------------------- performance (dev server; a regression guard, not the production gate)

test("1,000 enquiries: the list shows and search responds quickly", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  test.skip(!isDesktop(page), "desktop only");
  const bulk = Array.from({ length: 975 }, (_, index) =>
    buildRecord({ parentName: `Bulk Parent ${index + 1}`, phone: `+25678${String(index + 1).padStart(7, "0")}`, ageDays: index / 500 }),
  );
  await seedRecords(bulk);
  await openEnquiries(page);
  await showTable(page);
  await page.reload();
  const start = Date.now();
  await expect(page.getByText("Showing 1–20 of 1000 enquiries")).toBeVisible();
  const listMs = Date.now() - start;
  const searchStart = Date.now();
  await page.getByRole("searchbox").fill("Bulk Parent 777");
  await expect(page.getByText("Showing 1 of 1000 enquiries.")).toBeVisible();
  const searchMs = Date.now() - searchStart;
  testInfo.annotations.push({ type: "measurement", description: `list ${listMs} ms; search ${searchMs} ms (dev server)` });
  console.log(`[perf] 1,000 enquiries (dev server): list ${listMs} ms; search ${searchMs} ms`);
  expect(listMs).toBeLessThan(5_000);
  expect(searchMs).toBeLessThan(2_000);
});
