// Mobile: Moto G Power-class emulation with simulated 3G (Lighthouse default throttling).
const common = require("./lighthouserc.common.cjs");
module.exports = {
  ci: {
    collect: { ...common.collectBase, settings: { formFactor: "mobile", screenEmulation: { mobile: true, width: 412, height: 915, deviceScaleFactor: 2.625, disabled: false }, throttlingMethod: "simulate", throttling: { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4, requestLatencyMs: 562.5, downloadThroughputKbps: 1474.56, uploadThroughputKbps: 675 }, onlyCategories: common.onlyCategories } },
    upload: common.uploadBase,
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
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
