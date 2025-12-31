export interface CollectionSummary {
  totalFiles: number;
  totalBytes: number;
  topFiles: { path: string; bytes: number }[];
}

export function logStart(url: string): void {
  console.log(`\n[grab] Starting collection for: ${url}`);
  console.log(`[grab] Listening for JavaScript responses...\n`);
}

export function logResponse(url: string, bytes: number, saved: boolean): void {
  const status = saved ? "+" : "-";
  const size = formatBytes(bytes);
  console.log(`  [${status}] ${truncateUrl(url, 80)} (${size})`);
}

export function logAction(action: string): void {
  console.log(`\n[action] ${action}`);
}

export function logSummary(summary: CollectionSummary): void {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[summary] Collection complete`);
  console.log(`  Total files: ${summary.totalFiles}`);
  console.log(`  Total size:  ${formatBytes(summary.totalBytes)}`);

  if (summary.topFiles.length > 0) {
    console.log(`\n  Top ${summary.topFiles.length} largest files:`);
    summary.topFiles.forEach((f, i) => {
      console.log(`    ${i + 1}. ${formatBytes(f.bytes).padStart(10)} - ${f.path}`);
    });
  }
  console.log(`${"=".repeat(60)}\n`);
}

export function logError(message: string): void {
  console.error(`[error] ${message}`);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function truncateUrl(url: string, maxLen: number): string {
  if (url.length <= maxLen) return url;
  return url.slice(0, maxLen - 3) + "...";
}
