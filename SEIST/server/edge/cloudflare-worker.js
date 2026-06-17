export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/_server/health") {
      return json({
        ok: true,
        name: "seis-static",
        source: "cloudflare-worker",
        origin: env.SEIS_ORIGIN || null
      });
    }

    if (!env.SEIS_ORIGIN) {
      return json({ ok: false, error: "missing_origin" }, 500);
    }

    const originUrl = new URL(url.pathname + url.search, env.SEIS_ORIGIN);
    const response = await fetch(originUrl, request);
    const headers = new Headers(response.headers);
    headers.set("x-content-type-options", "nosniff");
    headers.set("referrer-policy", "strict-origin-when-cross-origin");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};

function json(payload, status = 200) {
  return new Response(`${JSON.stringify(payload, null, 2)}\n`, {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

