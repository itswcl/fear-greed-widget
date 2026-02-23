const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute per IP

const ipHits = new Map<string, number[]>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [ip, timestamps] of ipHits.entries()) {
    const valid = timestamps.filter((t) => t > cutoff);
    if (valid.length === 0) {
      ipHits.delete(ip);
    } else {
      ipHits.set(ip, valid);
    }
  }
}, 5 * 60_000);

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const hits = (ipHits.get(ip) || []).filter((t) => t > cutoff);
  hits.push(now);
  ipHits.set(ip, hits);
  return hits.length > MAX_REQUESTS;
}
