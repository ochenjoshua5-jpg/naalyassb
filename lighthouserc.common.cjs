/**
 * Shared Lighthouse CI settings for the public site (Day 6 gate).
 * Run against the production build on port 3000 (`npm run start:preview`).
 * Three runs per page; the median is used. Results are written to .lighthouseci/ (not uploaded).
 * The Chrome binary is taken from CHROME_PATH so the same run works in the sandbox and in CI.
 */
const PAGES = [
  "/",
  "/about",
  "/academics",
  "/school-life",
  "/news",
  "/admissions",
  "/admissions/enquiry",
  "/contact",
  "/privacy",
];

const HARD_LIMIT_BYTES = 1_500_000; // 1.5 MB total transfer, the Day 6 hard limit

module.exports = {
  PAGES,
  HARD_LIMIT_BYTES,
  // Run all four categories (a "preset" limits Lighthouse to Performance only).
  onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  collectBase: {
    url: PAGES.map((path) => `http://127.0.0.1:3000${path}`),
    numberOfRuns: 3,
    chromeFlags: "--no-sandbox --disable-dev-shm-usage",
  },
  uploadBase: { target: "filesystem", outputDir: ".lighthouseci" },
};
