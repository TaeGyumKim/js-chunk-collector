import type { Page } from "playwright";
import { addAction, type Manifest } from "../save/manifest.js";
import { logAction } from "../utils/log.js";

export interface ActionPlanOptions {
  scrollCount: number;
  clicks: string[];
}

export async function executeActionPlan(
  page: Page,
  manifest: Manifest,
  options: ActionPlanOptions
): Promise<void> {
  // Execute scroll actions
  for (let i = 0; i < options.scrollCount; i++) {
    const detail = `${i + 1}/${options.scrollCount}`;
    logAction(`scroll ${detail}`);
    addAction(manifest, "scroll", detail);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(800);
  }

  // Execute click actions
  for (const selector of options.clicks) {
    logAction(`click: ${selector}`);

    try {
      await page.click(selector, { timeout: 5000 });
      addAction(manifest, "click", selector);
      await page.waitForTimeout(1200);
    } catch (err) {
      const errorMsg = `${selector} (failed: ${(err as Error).message})`;
      logAction(`click failed: ${selector}`);
      addAction(manifest, "click", errorMsg);
    }
  }
}
