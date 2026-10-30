// GET /scan on zokascan.cc: the node's scan pages (see the node's
// `stark_api::scan_page`) through Cloudflare's cache. A full page under the
// latest checkpoint never changes and the node marks it immutable, so it leaves
// the team's PC once per data center instead of once per visitor. Anything
// else, the last page above all, goes straight through.
const API = "https://api.zokascan.cc";

export async function onRequestGet({ request, waitUntil }) {
  const query = new URL(request.url).search;
  const upstream = new Request(`${API}/scan${query}`, {
    headers: { accept: "application/octet-stream" },
  });
  const cache = caches.default;
  const hit = await cache.match(upstream);
  if (hit) return hit;
  const response = await fetch(upstream);
  if (response.ok && (response.headers.get("cache-control") || "").includes("immutable")) {
    waitUntil(cache.put(upstream, response.clone()));
  }
  return response;
}
