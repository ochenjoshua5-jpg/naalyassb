// Day 6 accessibility gate: axe-core WCAG 2.0/2.1 A + AA on every public page, desktop and mobile.
// Writes qa-accessibility-report.json at the repository root. Run against the production build.
// P0 = any violation with impact "critical" or "serious" (the blocking levels for launch).
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFileSync } from "node:fs";

const BASE = process.env.QA_BASE_URL ?? "http://127.0.0.1:3000";
const PAGES = ["/", "/about", "/academics", "/school-life", "/news", "/admissions", "/admissions/enquiry", "/contact", "/privacy"];
const VIEWPORTS = [
  { name: "desktop-1280", width: 1280, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
];
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/tmp/chromium", args: ["--no-sandbox"] });
const results = [];
for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await context.newPage();
  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: "load" });
    // Scroll the whole page so scroll-revealed content reaches its final opacity, then let animations settle.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 300) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
    });
    await page.waitForTimeout(1500);
    const axe = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    results.push({
      page: path,
      viewport: vp.name,
      violations: axe.violations.map((v) => ({
        id: v.id,
        impact: v.impact ?? "unknown",
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.length,
        targets: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
        summary: v.nodes[0]?.failureSummary ?? "",
      })),
      passes: axe.passes.length,
      incomplete: axe.incomplete.map((i) => i.id),
    });
  }
  await context.close();
}
await browser.close();

const p0 = results.flatMap((r) =>
  r.violations.filter((v) => v.impact === "critical" || v.impact === "serious").map((v) => ({ page: r.page, viewport: r.viewport, ...v })),
);
const summary = {
  generatedAt: new Date().toISOString(),
  standard: "WCAG 2.1 AA (axe-core tags: " + TAGS.join(", ") + ")",
  p0Definition: "violations with impact critical or serious",
  p0Count: p0.length,
  totalViolations: results.reduce((n, r) => n + r.violations.length, 0),
  pagesTested: PAGES.length,
  viewportsTested: VIEWPORTS.map((v) => v.name),
};
writeFileSync("qa-accessibility-report.json", JSON.stringify({ summary, p0, results }, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (p0.length) {
  for (const v of p0) console.log("P0", v.page, v.viewport, v.id, v.impact, v.nodes, v.targets.slice(0, 2).join(" | "));
}
