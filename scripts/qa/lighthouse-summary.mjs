// Summarises Lighthouse CI reports (3 runs per page) into a median per page.
// Usage: node scripts/qa/lighthouse-summary.cjs <reports-dir> <out.json> <mobile|desktop>
import fs from "node:fs";
import path from "node:path";

const [dir, out, form] = process.argv.slice(2);
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const byPage = new Map();
for (const f of fs.readdirSync(dir).filter((f) => f.startsWith("lhr-") && f.endsWith(".json"))) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const page = new URL(j.finalUrl).pathname;
  if (!byPage.has(page)) byPage.set(page, []);
  byPage.get(page).push(j);
}
const pages = {};
for (const [page, runs] of [...byPage.entries()].sort()) {
  const c = (k) => median(runs.map((r) => r.categories[k].score));
  const a = (k) => median(runs.map((r) => r.audits[k].numericValue));
  pages[page] = {
    runs: runs.length,
    performance: c("performance"),
    accessibility: c("accessibility"),
    bestPractices: c("best-practices"),
    seo: c("seo"),
    lcpMs: a("largest-contentful-paint"),
    tbtMs: a("total-blocking-time"),
    cls: a("cumulative-layout-shift"),
    transferKB: Math.round(median(runs.map((r) => r.audits["total-byte-weight"].numericValue)) / 1024),
  };
}
const report = {
  generatedAt: new Date().toISOString(),
  form,
  method: "median of 3 runs per page; Lighthouse CI, production build on 127.0.0.1:3000",
  pages,
};
fs.writeFileSync(out, JSON.stringify(report, null, 2) + "\n");
console.log(`wrote ${out} (${Object.keys(pages).length} pages)`);
