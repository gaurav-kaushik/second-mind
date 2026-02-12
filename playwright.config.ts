import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./tests/e2e/test-artifacts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "tests/e2e/results" }]],

  use: {
    baseURL: "http://localhost:3111",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },

  projects: [
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
    },
    {
      name: "desktop-chromium",
      testIgnore: /mobile\//,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "mobile-iphone",
      testMatch: /mobile\//,
      use: {
        // iPhone 14 viewport with Chromium (avoids WebKit install requirement)
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        storageState: "tests/e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "mobile-pixel",
      testMatch: /mobile\//,
      use: {
        ...devices["Pixel 7"],
        storageState: "tests/e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: "npm run dev -- --port 3111",
    url: "http://localhost:3111/api/health",
    reuseExistingServer: true,
    timeout: 30000,
  },
});
