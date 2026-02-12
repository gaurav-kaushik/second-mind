import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

const OUTPUT_DIR = path.resolve(__dirname, "../docs/ux-screenshots");
const AUTH_STATE = path.resolve(__dirname, "../tests/e2e/.auth/user.json");
const BASE_URL = "http://localhost:3111";

async function main() {
  // Check auth state exists (run npm run test:e2e first)
  if (!fs.existsSync(AUTH_STATE)) {
    console.error(
      "Auth state not found. Run `npm run test:e2e` first to create it."
    );
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();

  // --- Login page (no auth) ---
  const loginCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const loginPage = await loginCtx.newPage();
  await loginPage.goto(`${BASE_URL}/login`);
  await loginPage.waitForTimeout(1000);
  await loginPage.screenshot({ path: `${OUTPUT_DIR}/01-login-page.png` });
  await loginCtx.close();

  // --- Desktop screenshots (authenticated) ---
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    storageState: AUTH_STATE,
  });
  const page = await desktopContext.newPage();

  // Landing page
  await page.goto(BASE_URL);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUTPUT_DIR}/02-landing-page.png` });

  // Command bar - empty
  await page.keyboard.press("Meta+k");
  await page.waitForSelector('[placeholder="Ask, store, search, or plan..."]');
  await page.screenshot({ path: `${OUTPUT_DIR}/03-command-bar-empty.png` });

  // Command bar - loading state
  await page.getByPlaceholder("Ask, store, search, or plan...").fill("what should I read next?");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUTPUT_DIR}/04-command-bar-loading.png` });

  // Command bar - with response
  await page.waitForSelector("[class*='max-w-none']", { timeout: 30000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUTPUT_DIR}/05-command-bar-response.png` });

  // Conversation thread
  await page.getByPlaceholder("Ask, store, search, or plan...").fill("tell me more about that");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUTPUT_DIR}/06-command-bar-conversation.png` });

  // Memory inspector - list
  await page.keyboard.press("Escape");
  await page.keyboard.press("Meta+k");
  await page.getByPlaceholder("Ask, store, search, or plan...").fill("/memory");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUTPUT_DIR}/07-memory-inspector-list.png` });

  // Memory inspector - file view
  await page.getByText("Gaurav.md").click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUTPUT_DIR}/08-memory-inspector-file.png` });

  // Memory inspector - edit view
  await page.getByRole("button", { name: "Edit" }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUTPUT_DIR}/09-memory-inspector-edit.png` });

  await desktopContext.close();

  // --- Mobile screenshots (authenticated) ---
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    storageState: AUTH_STATE,
  });
  const mobilePage = await mobileContext.newPage();

  // Mobile landing
  await mobilePage.goto(BASE_URL);
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: `${OUTPUT_DIR}/10-mobile-landing.png` });

  // Mobile conversation
  await mobilePage.getByPlaceholder("Ask, store, search, or plan...").fill("hello from mobile");
  await mobilePage.getByLabel("Send").click();
  await mobilePage.waitForSelector("[class*='max-w-none']", { timeout: 30000 });
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: `${OUTPUT_DIR}/11-mobile-conversation.png` });

  // Mobile memory inspector
  await mobilePage.getByPlaceholder("Ask, store, search, or plan...").fill("/memory");
  await mobilePage.getByLabel("Send").click();
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: `${OUTPUT_DIR}/12-mobile-memory-inspector.png` });

  await mobileContext.close();
  await browser.close();

  console.log(`Screenshots saved to ${OUTPUT_DIR}`);
}

main().catch(console.error);
