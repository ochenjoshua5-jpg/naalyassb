// Day 6 viewport gate (375, 390, 412, 768, 1280 px): no horizontal overflow, hamburger menu works,
// interactive targets at least 44 x 44 CSS px, no broken images. Screenshots go to qa-screenshots/.
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const BASE = process.env.QA_BASE_URL ?? "http://127.0.0.1:3000";
const PAGES = ["/", "/about", "/academics", "/school-life", "/news", "/admissions", "/admissions/enquiry", "/contact", "/privacy"];
const WIDTHS = [375, 390, 412, 768, 1280];
const MIN = 44;

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/tmp/chromium", args: ["--no-sandbox"] });
const report = { generatedAt: new Date().toISOString(), widths: WIDTHS, pages: [], menu: [], failures: [] };

for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 1, isMobile: width < 1024, hasTouch: width < 1024 });
  const page = await ctx.newPage();
  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: "load" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    });
    await page.waitForTimeout(900);
    const m = await page.evaluate(({ MIN }) => {
      const doc = document.documentElement;
      const overflow = doc.scrollWidth - doc.clientWidth;
      const offenders = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none") continue;
        if (r.right > doc.clientWidth + 1 && !el.closest("[data-scroll-x-ok]") && cs.position !== "fixed") {
          if (offenders.length < 5) offenders.push((el.className && el.className.baseVal === undefined ? el.className : el.tagName).toString().slice(0, 60) + " right=" + Math.round(r.right));
        }
      }
      const small = [];
      let inlineExempt = 0;
      const interactive = document.querySelectorAll("a[href], button, input, select, textarea, summary, [role='button'], [role='tab']");
      for (const el of interactive) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none") continue;
        if (el.closest("[aria-hidden='true']") || el.closest("[data-qa-skip]")) continue;
        // Skip-link is off-screen until focused by design.
        if (el.classList.contains("sr-only") || cs.position === "absolute" && r.top < -1000) continue;
        // Inline links inside running copy are exempt under WCAG 2.5.8 (Target Size, AA): they are counted, not failed.
        const inlineText =
          el.tagName === "A" &&
          cs.display === "inline" &&
          el.parentElement !== null &&
          el.parentElement.textContent.trim().length > el.textContent.trim().length;
        if (inlineText) { inlineExempt++; continue; }
        if (r.width < MIN || r.height < MIN) {
          if (small.length < 8) small.push({ text: (el.textContent || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) });
        }
      }
      const broken = [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src.slice(-60));
      return { overflow, offenders, small, smallCount: small.length, broken, imageCount: document.images.length, title: document.title, inlineExempt };
    }, { MIN });
    const shot = `qa-screenshots/${path === "/" ? "home" : path.replace(/\//g, "-").replace(/^-/, "")}-${width}.png`;
    await page.screenshot({ path: shot, fullPage: true });
    report.pages.push({ width, path, ...m, screenshot: shot });
    if (m.overflow > 0 || m.smallCount > 0 || m.broken.length > 0) report.failures.push({ width, path, overflow: m.overflow, small: m.small, broken: m.broken, offenders: m.offenders });
  }

  // Hamburger menu (below the xl breakpoint, 1280px shows the desktop navigation instead).
  if (width < 1280) {
    await page.goto(BASE + "/", { waitUntil: "load" });
    const btn = page.getByRole("button", { name: "Open menu" });
    await btn.click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible", timeout: 5000 });
    const links = await dialog.getByRole("link").count();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `qa-screenshots/menu-open-${width}.png` });
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden", timeout: 5000 });
    const focusBack = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute("aria-label"));
    report.menu.push({ width, opened: true, linksInMenu: links, closedWithEscape: true, focusReturnedTo: focusBack });
  }
  await ctx.close();
}
await browser.close();
report.summary = {
  pagesChecked: report.pages.length,
  failingPageWidths: report.failures.length,
  menuChecks: report.menu.length,
};
writeFileSync("qa-viewport-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.summary));
console.log(JSON.stringify(report.menu));
for (const f of report.failures.slice(0, 30)) console.log("FAIL", f.width, f.path, JSON.stringify({ overflow: f.overflow, small: f.small.slice(0, 4), broken: f.broken, offenders: f.offenders.slice(0, 3) }));
