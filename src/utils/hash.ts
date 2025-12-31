import { createHash } from "crypto";

export function sha1Short(input: string, length = 8): string {
  return createHash("sha1").update(input).digest("hex").slice(0, length);
}
