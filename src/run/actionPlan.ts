import type { Page } from "playwright";
import { logAction } from "../utils/log.js";

export interface ActionPlanOptions {
  scrollCount: number;
  clicks: string[];
  hovers: string[];
  routes: string[];
}

export async function executeActionPlan(
  page: Page,
  options: ActionPlanOptions
): Promise<string[]> {
  const actions: string[] = [];

  // Execute scroll actions
  for (let i = 0; i < options.scrollCount; i++) {
    const action = `scroll ${i + 1}/${options.scrollCount}`;
    logAction(action);
    actions.push(action);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(800);
  }

  // Execute click actions
  for (const selector of options.clicks) {
    const action = `click: ${selector}`;
    logAction(action);
    actions.push(action);

    try {
      await page.click(selector, { timeout: 5000 });
      await page.waitForTimeout(1200);
    } catch (err) {
      const errorAction = `click failed: ${selector} - ${(err as Error).message}`;
      logAction(errorAction);
      actions.push(errorAction);
    }
  }

  // Execute hover actions
  for (const selector of options.hovers) {
    const action = `hover: ${selector}`;
    logAction(action);
    actions.push(action);

    try {
      await page.hover(selector, { timeout: 5000 });
      await page.waitForTimeout(800);
    } catch (err) {
      const errorAction = `hover failed: ${selector} - ${(err as Error).message}`;
      logAction(errorAction);
      actions.push(errorAction);
    }
  }

  return actions;
}

export async function navigateRoutes(
  page: Page,
  baseUrl: string,
  routes: string[],
  onNavigate: () => Promise<void>
): Promise<string[]> {
  const actions: string[] = [];
  const origin = new URL(baseUrl).origin;

  for (const route of routes) {
    const fullUrl = new URL(route, origin).href;
    const action = `navigate: ${route}`;
    logAction(action);
    actions.push(action);

    try {
      await page.goto(fullUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      await onNavigate();
    } catch (err) {
      const errorAction = `navigate failed: ${route} - ${(err as Error).message}`;
      logAction(errorAction);
      actions.push(errorAction);
    }
  }

  return actions;
}
