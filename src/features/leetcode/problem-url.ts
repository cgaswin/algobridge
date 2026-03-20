const LEETCODE_HOSTNAMES = new Set(['leetcode.com', 'www.leetcode.com']);

export function extractLeetCodeProblemSlug(url: string): string | null {
  try {
    const parsedUrl = new URL(url);

    if (!LEETCODE_HOSTNAMES.has(parsedUrl.hostname)) {
      return null;
    }

    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    const problemIndex = segments.indexOf('problems');

    if (problemIndex === -1 || problemIndex + 1 >= segments.length) {
      return null;
    }

    const slug = segments[problemIndex + 1]?.trim().toLowerCase();
    if (!slug) {
      return null;
    }

    return slug;
  } catch {
    return null;
  }
}

export function formatProblemTitleFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(' ');
}
