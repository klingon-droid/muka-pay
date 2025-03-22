// <define:__ROUTES__>
var define_ROUTES_default = {
  version: 1,
  include: [
    "/*"
  ],
  exclude: [
    "/_astro/*",
    "/circuit.wasm",
    "/circuit_final.zkey",
    "/favicon.svg",
    "/logo.png",
    "/manifest.json",
    "/pwa-192x192.png",
    "/pwa-512x512.png",
    "/models/*"
  ]
};

// node_modules/.pnpm/wrangler@4.3.0_@cloudflare+workers-types@4.20250320.0_bufferutil@4.0.9_utf-8-validate@5.0.10/node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "/Users/junyaoc/Documents/lab/mukapay-client/.wrangler/tmp/pages-S5zNDC/bundledWorker-0.005699871247469179.mjs";
import { isRoutingRuleMatch } from "/Users/junyaoc/Documents/lab/mukapay-client/node_modules/.pnpm/wrangler@4.3.0_@cloudflare+workers-types@4.20250320.0_bufferutil@4.0.9_utf-8-validate@5.0.10/node_modules/wrangler/templates/pages-dev-util.ts";
export * from "/Users/junyaoc/Documents/lab/mukapay-client/.wrangler/tmp/pages-S5zNDC/bundledWorker-0.005699871247469179.mjs";
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = worker;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=deq9wxqd5mr.js.map
