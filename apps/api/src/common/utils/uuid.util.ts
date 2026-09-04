const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Validate a route param looks like a UUID before it ever reaches a query — a malformed id (e.g. a human-readable code passed by mistake) should 400, not crash the DB driver with a 500. */
export function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
