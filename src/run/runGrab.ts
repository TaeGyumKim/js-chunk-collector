import { chromium, type Response } from "playwright";
import { shouldKeep, type FilterOptions } from "../filter/shouldKeep.js";
import { saveResponse } from "../save/saveResponse.js";
import {
  createManifest,
  addEntry,
  addAction,
  writeManifest,
  type Manifest,
} from "../save/manifest.js";
import { logStart, logResponse, logSummary, logError } from "../utils/log.js";
import { executeActionPlan, navigateRoutes } from "./actionPlan.js";

export interface GrabOptions {
  url: string;
  outDir: string;
  sameOrigin: boolean;
  include?: string;
  exclude?: string;
  wait: number;
  timeout: number;
  scrollCount: number;
  clicks: string[];
  hovers: string[];
  routes: string[];
}

export async function runGrab(options: GrabOptions): Promise<void> {
  const seenUrls = new Set<string>();
  const manifest = createManifest(options.url);

  const filterOptions: FilterOptions = {
    sameOrigin: options.sameOrigin,
    include: options.include ? new RegExp(options.include) : undefined,
    exclude: options.exclude ? new RegExp(options.exclude) : undefined,
    baseOrigin: options.url,
  };

  logStart(options.url);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  // Response handler
  const handleResponse = async (response: Response): Promise<void> => {
    const url = response.url();

    // Skip if already seen
    if (seenUrls.has(url)) {
      return;
    }

    const contentType = response.headers()["content-type"] ?? null;

    if (!shouldKeep(url, contentType, filterOptions)) {
      return;
    }

    seenUrls.add(url);

    try {
      const body = await response.body();
      const result = await saveResponse(url, body, options.outDir);

      addEntry(manifest, {
        url,
        savedAs: result.savedAs,
        bytes: result.bytes,
        contentType,
      });

      logResponse(url, result.bytes, true);
    } catch (err) {
      // Response body not available (e.g., redirect, cancelled)
      logError(`Failed to save ${url}: ${(err as Error).message}`);
    }
  };

  page.on("response", handleResponse);

  try {
    // Navigate to URL
    await page.goto(options.url, {
      waitUntil: "domcontentloaded",
      timeout: options.timeout,
    });

    // Wait for network to settle
    try {
      await page.waitForLoadState("networkidle", { timeout: options.wait });
    } catch {
      // networkidle timeout is acceptable, continue anyway
    }

    // Execute action plan
    const actionPlanOptions = {
      scrollCount: options.scrollCount,
      clicks: options.clicks,
      hovers: options.hovers,
      routes: options.routes,
    };

    const actions = await executeActionPlan(page, actionPlanOptions);
    actions.forEach((action) => addAction(manifest, action));

    // Navigate additional routes
    if (options.routes.length > 0) {
      const waitForResponses = async () => {
        try {
          await page.waitForLoadState("networkidle", { timeout: options.wait });
        } catch {
          // Continue anyway
        }
      };

      const routeActions = await navigateRoutes(
        page,
        options.url,
        options.routes,
        waitForResponses
      );
      routeActions.forEach((action) => addAction(manifest, action));
    }

    // Final wait
    await page.waitForTimeout(options.wait);
  } catch (err) {
    logError(`Page error: ${(err as Error).message}`);
  } finally {
    await browser.close();
  }

  // Write manifest
  await writeManifest(manifest, options.outDir);

  // Print summary
  const sortedFiles = [...manifest.files].sort((a, b) => b.bytes - a.bytes);
  logSummary({
    totalFiles: manifest.files.length,
    totalBytes: manifest.files.reduce((sum, f) => sum + f.bytes, 0),
    topFiles: sortedFiles.slice(0, 5).map((f) => ({
      path: f.savedAs,
      bytes: f.bytes,
    })),
  });
}
