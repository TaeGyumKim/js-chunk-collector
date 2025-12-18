#!/usr/bin/env node

import { Command } from "commander";
import { runGrab } from "./run/runGrab.js";

const program = new Command();

program
  .name("grab")
  .description("Collect JavaScript chunks from web pages during loading")
  .version("0.1.0")
  .requiredOption("--url <url>", "URL to collect JavaScript from")
  .option("--out <dir>", "Output directory", "./out")
  .option("--same-origin", "Only collect same-origin scripts", false)
  .option("--include <regex>", "Include URLs matching regex")
  .option("--exclude <regex>", "Exclude URLs matching regex")
  .option("--wait <ms>", "Wait time for network idle (ms)", "1500")
  .option("--timeout <ms>", "Page load timeout (ms)", "45000")
  .option("--scroll <n>", "Number of scroll actions", "0")
  .option(
    "--click <selector>",
    "Click selector (can be used multiple times)",
    collect,
    []
  )
  .option("--headful", "Run browser in headful mode", false)
  .action(async (opts) => {
    try {
      await runGrab({
        url: opts.url,
        outDir: opts.out,
        sameOrigin: opts.sameOrigin,
        include: opts.include,
        exclude: opts.exclude,
        wait: parseInt(opts.wait, 10),
        timeout: parseInt(opts.timeout, 10),
        scrollCount: parseInt(opts.scroll, 10),
        clicks: opts.click,
        headful: opts.headful,
      });
    } catch (err) {
      console.error("Fatal error:", (err as Error).message);
      process.exit(1);
    }
  });

function collect(value: string, previous: string[]): string[] {
  return previous.concat([value]);
}

program.parse();
