import path from "path";
import { sha1Short } from "../utils/hash.js";

export interface PathMapResult {
  host: string;
  relativePath: string;
  fullPath: string;
}

export function urlToSavePath(url: string, outDir: string): PathMapResult {
  const parsed = new URL(url);
  const host = sanitizeFilename(parsed.host);

  let pathname = parsed.pathname;

  // Handle root path
  if (pathname === "/" || pathname === "") {
    pathname = "/index.js";
  }

  // Ensure .js extension
  if (!hasJsLikeExtension(pathname)) {
    pathname = pathname + ".js";
  }

  // Build filename with query hash if needed
  let filename = path.basename(pathname);
  if (parsed.search) {
    const queryHash = sha1Short(parsed.search);
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    filename = `${base}__q_${queryHash}${ext}`;
  }

  // Build directory path from URL pathname
  const dirPath = path.dirname(pathname);
  const sanitizedDir = dirPath
    .split("/")
    .filter(Boolean)
    .map(sanitizeFilename)
    .join("/");

  const relativePath = sanitizedDir
    ? `${host}/${sanitizedDir}/${filename}`
    : `${host}/${filename}`;

  const fullPath = path.join(outDir, relativePath);

  return { host, relativePath, fullPath };
}

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"|?*]/g, "_").replace(/\.\./g, "_");
}

function hasJsLikeExtension(pathname: string): boolean {
  const lower = pathname.toLowerCase();
  return lower.endsWith(".js") || lower.endsWith(".mjs") || lower.endsWith(".cjs");
}
