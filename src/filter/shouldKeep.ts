export interface FilterOptions {
  sameOrigin: boolean;
  include?: RegExp;
  exclude?: RegExp;
  baseOrigin: string;
}

const JS_CONTENT_TYPES = [
  "application/javascript",
  "application/x-javascript",
  "application/ecmascript",
  "text/javascript",
  "text/ecmascript",
];

const JS_EXTENSIONS = [".js", ".mjs", ".cjs"];

export function shouldKeep(
  url: string,
  contentType: string | null,
  options: FilterOptions
): boolean {
  const parsedUrl = new URL(url);

  // Same-origin filter
  if (options.sameOrigin) {
    const baseOrigin = new URL(options.baseOrigin).origin;
    if (parsedUrl.origin !== baseOrigin) {
      return false;
    }
  }

  // Include filter
  if (options.include && !options.include.test(url)) {
    return false;
  }

  // Exclude filter
  if (options.exclude && options.exclude.test(url)) {
    return false;
  }

  // Content-type check
  if (contentType && isJsContentType(contentType)) {
    return true;
  }

  // URL extension fallback
  if (hasJsExtension(parsedUrl.pathname)) {
    return true;
  }

  return false;
}

function isJsContentType(contentType: string): boolean {
  const normalized = contentType.toLowerCase().split(";")[0].trim();
  return JS_CONTENT_TYPES.includes(normalized);
}

function hasJsExtension(pathname: string): boolean {
  const lower = pathname.toLowerCase();
  return JS_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
