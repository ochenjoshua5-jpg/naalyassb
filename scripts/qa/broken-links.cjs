// Day 6 link gate: crawl internal links only (external links are excluded on purpose) and write qa-broken-links.json.
const blc = require("broken-link-checker");
const { writeFileSync } = require("node:fs");

const start = process.env.QA_BASE_URL ?? "http://127.0.0.1:3000/";
const links = [];
const broken = [];
const seen = new Set();
const checker = new blc.SiteChecker(
  { excludeExternalLinks: true, honorRobotExclusions: true, excludeLinksToSamePage: false, requestMethod: "head", filterLevel: 0, maxSocketsPerHost: 4, timeout: 15000 },
  {
    link(result) {
      const key = result.url.resolved || result.url.original;
      if (!seen.has(key)) seen.add(key);
      links.push({ url: result.url.original, resolved: result.url.resolved, broken: result.broken, status: result.http.response ? result.http.response.statusCode : null, reason: result.brokenReason, base: result.base.resolved });
      if (result.broken) broken.push({ url: result.url.original, resolved: result.url.resolved, reason: result.brokenReason, foundOn: result.base.resolved, status: result.http.response ? result.http.response.statusCode : null });
    },
    end() {
      const report = {
        generatedAt: new Date().toISOString(),
        start,
        scope: "internal links only (external excluded)",
        linksChecked: links.length,
        uniqueLinks: seen.size,
        brokenCount: broken.length,
        broken,
        note: "Fee-structure PDFs and other unapproved documents are not linked anywhere on the site (fees are withheld with a notice).",
      };
      writeFileSync("qa-broken-links.json", JSON.stringify(report, null, 2));
      console.log(JSON.stringify({ linksChecked: links.length, uniqueLinks: seen.size, brokenCount: broken.length, broken: broken.slice(0, 20) }, null, 2));
    },
  },
);
checker.enqueue(start);
