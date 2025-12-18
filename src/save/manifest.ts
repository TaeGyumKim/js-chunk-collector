import { writeFile, readFile, mkdir } from "fs/promises";
import path from "path";

export interface ManifestEntry {
  url: string;
  savedAs: string;
  bytes: number;
  contentType: string | null;
  timestamp: string;
}

export interface Manifest {
  version: string;
  baseUrl: string;
  collectedAt: string;
  actions: string[];
  files: ManifestEntry[];
}

export function createManifest(baseUrl: string): Manifest {
  return {
    version: "1.0",
    baseUrl,
    collectedAt: new Date().toISOString(),
    actions: [],
    files: [],
  };
}

export function addEntry(
  manifest: Manifest,
  entry: Omit<ManifestEntry, "timestamp">
): void {
  manifest.files.push({
    ...entry,
    timestamp: new Date().toISOString(),
  });
}

export function addAction(manifest: Manifest, action: string): void {
  manifest.actions.push(action);
}

export async function writeManifest(
  manifest: Manifest,
  outDir: string
): Promise<void> {
  const manifestPath = path.join(outDir, "manifest.json");
  await mkdir(outDir, { recursive: true });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
}

export async function loadManifest(outDir: string): Promise<Manifest | null> {
  const manifestPath = path.join(outDir, "manifest.json");
  try {
    const content = await readFile(manifestPath, "utf-8");
    return JSON.parse(content) as Manifest;
  } catch {
    return null;
  }
}
