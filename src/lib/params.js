// src/lib/params.js

function safeParse(value) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/**
 * Next.js 15/16 can hand server components serialized params.
 * This helper normalizes them back into plain objects.
 */
export function resolveParams(input) {
  if (!input) return {};

  if (typeof input === "string") {
    return safeParse(input) ?? {};
  }

  if (typeof input === "object" && typeof input.value === "string") {
    return safeParse(input.value) ?? {};
  }

  return input;
}

