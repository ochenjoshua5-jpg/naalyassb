// Desktop: Lighthouse "desktop" preset, no mobile throttling.
const common = require("./lighthouserc.common.cjs");
module.exports = {
  ci: {
    collect: { ...common.collectBase, settings: { preset: "desktop", onlyCategories: common.onlyCategories } },
    upload: common.uploadBase,
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 200 }],
        "total-byte-weight": ["error", { maxNumericValue: common.HARD_LIMIT_BYTES }],
      },
    },
  },
};
