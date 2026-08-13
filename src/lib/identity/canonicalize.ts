const TRACKING_PARAM_PREFIXES = ["utm_", "ref", "fbclid", "gclid", "mc_"];

/**
 * Company identity is based primarily on canonical domain. Strips protocol,
 * `www.`, trailing paths/slashes, and tracking query params so
 * `https://www.Acme.com/?utm_source=x` and `acme.com` resolve to the same
 * canonical domain. When genuinely uncertain, callers should keep two
 * records rather than wrongly merge (see CLAUDE.md).
 */
export function canonicalizeDomain(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("canonicalizeDomain: empty input");

  let url: URL;
  try {
    url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    throw new Error(`canonicalizeDomain: invalid URL "${input}"`);
  }

  let host = url.hostname.toLowerCase();
  if (host.startsWith("www.")) host = host.slice(4);

  return host;
}

export function isTrackingParam(key: string): boolean {
  const lower = key.toLowerCase();
  return TRACKING_PARAM_PREFIXES.some((p) => lower.startsWith(p));
}

/**
 * Canonicalizes a full URL (not just the domain) for provenance / sourceUrl
 * storage: lowercases the host, strips tracking params, strips a trailing
 * slash on the path, and drops the fragment.
 */
export function canonicalizeUrl(input: string): string {
  const trimmed = input.trim();
  const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);

  let host = url.hostname.toLowerCase();
  if (host.startsWith("www.")) host = host.slice(4);

  const params = new URLSearchParams();
  for (const [key, value] of url.searchParams.entries()) {
    if (!isTrackingParam(key)) params.append(key, value);
  }
  const query = params.toString();

  let path = url.pathname;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

  return `${url.protocol}//${host}${path}${query ? `?${query}` : ""}`;
}
