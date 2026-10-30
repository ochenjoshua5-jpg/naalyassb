import { defineConfig, devices } from "@playwright/test";

/**
 * Two servers, started with explicit environment:
 * - 3000 "closed":  production build, ENQUIRY_STORE=disabled and STAFF_DASHBOARD unset (the public preview
 *                   state). No form, and every /staff route answers 404.
 * - 3001 "test":    DEVELOPMENT server, ENQUIRY_STORE=test-file. The form works; records go to a temp file
 *                   outside the repo. A development server is needed because the app refuses test modes
 *                   whenever NODE_ENV=production (which `next start` always sets). The backend-failure
 *                   tests simulate an outage with a flag file that the real store checks on every insert.
 *                   STAFF_DASHBOARD=test enables the staff dashboard with test-only sign-in headers.
 *                   The production build refuses this setting.
 *
 * Run `npm run build` first (needed for the closed server). Workers are fixed at 1 because
 * the test-mode tests share one temp file.
 */
const PORT_CLOSED = 3000;
const PORT_TEST = 3001;

const sandboxChromium = process.env.PW_CHROMIUM_PATH || undefined;
const launchOptions = sandboxChromium
  ? { executablePath: sandboxChromium, args: ["--no-sandbox", "--disable-dev-shm-usage"] }
  : {};

const viewports = {
  "375": { width: 375, height: 812 },
  "1280": { width: 1280, height: 800 },
} as const;

function project(name: string, port: number, testMatch: string | string[], viewport: keyof typeof viewports) {
  return {
    name,
    testMatch,
    use: {
      ...devices["Desktop Chrome"],
      baseURL: `http://127.0.0.1:${port}`,
      viewport: viewports[viewport],
      launchOptions,
      trace: "retain-on-failure" as const,
      screenshot: "only-on-failure" as const,
    },
  };
}

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results",
  globalTeardown: "./tests/support/global-teardown.ts",
  projects: [
    project("open-375", PORT_TEST, "**/enquiry-open.spec.ts", "375"),
    project("open-1280", PORT_TEST, "**/enquiry-open.spec.ts", "1280"),
    project("backend-down-375", PORT_TEST, "**/enquiry-backend-down.spec.ts", "375"),
    project("backend-down-1280", PORT_TEST, "**/enquiry-backend-down.spec.ts", "1280"),
    project("staff-api", PORT_TEST, "**/staff-api.spec.ts", "1280"),
    project("staff-ui-375", PORT_TEST, "**/staff-ui.spec.ts", "375"),
    project("staff-ui-1280", PORT_TEST, "**/staff-ui.spec.ts", "1280"),
    project("closed-375", PORT_CLOSED, ["**/enquiry-closed.spec.ts", "**/staff-closed.spec.ts"], "375"),
    project("closed-1280", PORT_CLOSED, ["**/enquiry-closed.spec.ts", "**/staff-closed.spec.ts"], "1280"),
  ],
  webServer: [
    {
      command: `npx next start -H 127.0.0.1 -p ${PORT_CLOSED}`,
      port: PORT_CLOSED,
      reuseExistingServer: false,
      timeout: 120_000,
      env: { ENQUIRY_STORE: "disabled" },
    },
    {
      command: `npx next dev -H 127.0.0.1 -p ${PORT_TEST}`,
      port: PORT_TEST,
      reuseExistingServer: false,
      timeout: 180_000,
      env: { ENQUIRY_STORE: "test-file", STAFF_DASHBOARD: "test" },
    },
  ],
});
