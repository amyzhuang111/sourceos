/**
 * Fetches a company's public homepage as plain text for the research agent
 * to analyze. Only ever a plain unauthenticated GET of a public URL — never
 * bypasses auth/paywalls, and honors a simple robots.txt disallow check
 * before fetching (CLAUDE.md: "Do not bypass ... robots restrictions").
 */

const USER_AGENT = "SourceOS/0.1 (+https://github.com/; research bot, honors robots.txt)";

async function isDisallowedByRobots(url: URL): Promise<boolean> {
  try {
    const robotsUrl = `${url.protocol}//${url.host}/robots.txt`;
    const res = await fetch(robotsUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return false;
    const text = await res.text();

    let applies = false;
    const disallows: string[] = [];
    for (const rawLine of text.split("\n")) {
      const line = rawLine.split("#")[0].trim();
      if (!line) continue;
      const [rawKey, ...rest] = line.split(":");
      const key = rawKey.trim().toLowerCase();
      const value = rest.join(":").trim();
      if (key === "user-agent") {
        applies = value === "*";
      } else if (key === "disallow" && applies && value) {
        disallows.push(value);
      }
    }
    return disallows.some((rule) => url.pathname.startsWith(rule));
  } catch {
    // If robots.txt is unreachable, don't block the fetch on that alone.
    return false;
  }
}

/** Minimal, dependency-free HTML-to-text: drop script/style, strip tags. */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export interface FetchedPage {
  url: string;
  text: string;
  fetchedAt: string;
}

export async function fetchWebsiteText(rawUrl: string, maxChars = 6000): Promise<FetchedPage | null> {
  const url = new URL(rawUrl.includes("://") ? rawUrl : `https://${rawUrl}`);

  if (await isDisallowedByRobots(url)) {
    return null;
  }

  try {
    const res = await fetch(url.toString(), {
      headers: { "user-agent": USER_AGENT },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("text")) return null;

    const html = await res.text();
    const text = htmlToText(html).slice(0, maxChars);
    return { url: url.toString(), text, fetchedAt: new Date().toISOString() };
  } catch {
    return null;
  }
}
