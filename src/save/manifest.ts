import { writeFile, mkdir } from "fs/promises";
import path from "path";

export interface ManifestItem {
  url: string;
  savedAs: string;
  bytes: number;
  contentType?: string;
}

export interface ManifestAction {
  type: "goto" | "wait" | "scroll" | "click" | "hover";
  detail: string;
  at: string;
}

export interface Manifest {
  target: string;
  count: number;
  items: ManifestItem[];
  actions: ManifestAction[];
}

export function createManifest(target: string): Manifest {
  return {
    target,
    count: 0,
    items: [],
    actions: [],
  };
}

export function addItem(manifest: Manifest, item: ManifestItem): void {
  manifest.items.push(item);
  manifest.count = manifest.items.length;
}

export function addAction(
  manifest: Manifest,
  type: ManifestAction["type"],
  detail: string
): void {
  manifest.actions.push({
    type,
    detail,
    at: new Date().toISOString(),
  });
}

export async function writeManifest(
  manifest: Manifest,
  outDir: string
): Promise<void> {
  const manifestPath = path.join(outDir, "manifest.json");
  await mkdir(outDir, { recursive: true });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
}
