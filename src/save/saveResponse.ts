import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { urlToSavePath } from "./pathMap.js";

export interface SaveResult {
  savedAs: string;
  bytes: number;
  fullPath: string;
}

export async function saveResponse(
  url: string,
  body: Buffer,
  outDir: string
): Promise<SaveResult> {
  const { relativePath, fullPath } = urlToSavePath(url, outDir);

  // Ensure directory exists
  const dir = path.dirname(fullPath);
  await mkdir(dir, { recursive: true });

  // Write file
  await writeFile(fullPath, body);

  return {
    savedAs: relativePath,
    bytes: body.length,
    fullPath,
  };
}
