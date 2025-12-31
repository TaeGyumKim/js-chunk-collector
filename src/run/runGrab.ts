import { chromium, type Response } from "playwright";
import { shouldKeep, type FilterOptions } from "../filter/shouldKeep.js";
import { saveResponse } from "../save/saveResponse.js";
import {
  createManifest,
  addItem,
  addAction,
  writeManifest,
} from "../save/manifest.js";
import { logStart, logResponse, logSummary, logError } from "../utils/log.js";
import { executeActionPlan } from "./actionPlan.js";

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
  headful: boolean;
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

  const browser = await chromium.launch({ headless: !options.headful });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  const handleResponse = async (response: Response): Promise<void> => {
    const url = response.url();

    if (seenUrls.has(url)) return;

    const contentType = response.headers()["content-type"] ?? undefined;

    if (!shouldKeep(url, contentType ?? null, filterOptions)) return;

    seenUrls.add(url);

    try {
      const body = await response.body();
      const result = await saveResponse(url, body, options.outDir);

      addItem(manifest, {
        url,
        savedAs: result.savedAs,
        bytes: result.bytes,
        contentType,
      });

      logResponse(url, result.bytes, true);
    } catch (err) {
      logError(`Failed to save ${url}: ${(err as Error).message}`);
    }
  };

  page.on("response", handleResponse);

  try {
    addAction(manifest, "goto", options.url);
    await page.goto(options.url, {
      waitUntil: "domcontentloaded",
      timeout: options.timeout,
    });

    addAction(manifest, "wait", `networkidle ${options.wait}ms`);
    try {
      await page.waitForLoadState("networkidle", { timeout: options.wait });
    } catch {
      // networkidle timeout is acceptable
    }

    await executeActionPlan(page, manifest, {
      scrollCount: options.scrollCount,
      clicks: options.clicks,
    });

    await page.waitForTimeout(options.wait);
  } catch (err) {
    logError(`Page error: ${(err as Error).message}`);
  } finally {
    await browser.close();
  }

  await writeManifest(manifest, options.outDir);

  const sortedFiles = [...manifest.items].sort((a, b) => b.bytes - a.bytes);
  logSummary({
    totalFiles: manifest.count,
    totalBytes: manifest.items.reduce((sum, f) => sum + f.bytes, 0),
    topFiles: sortedFiles.slice(0, 5).map((f) => ({
      path: f.savedAs,
      bytes: f.bytes,
    })),
  });
}
