var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// _worker.js/index.js
import { renderers } from "./renderers.mjs";
import { a as actions } from "./chunks/_noop-actions_Dk2yPKP3.mjs";
import { c as createExports, s as serverEntrypointModule } from "./chunks/_@astrojs-ssr-adapter_CQRtlbj1.mjs";
import { manifest } from "./manifest_B8nECSVu.mjs";
globalThis.process ??= {};
globalThis.process.env ??= {};
var serverIslandMap = /* @__PURE__ */ new Map();
var _page0 = /* @__PURE__ */ __name(() => import("./pages/_image.astro.mjs"), "_page0");
var _page1 = /* @__PURE__ */ __name(() => import("./pages/api/balance/_username_.astro.mjs"), "_page1");
var _page2 = /* @__PURE__ */ __name(() => import("./pages/api/pay.astro.mjs"), "_page2");
var _page3 = /* @__PURE__ */ __name(() => import("./pages/api/register.astro.mjs"), "_page3");
var _page4 = /* @__PURE__ */ __name(() => import("./pages/api/withdraw.astro.mjs"), "_page4");
var _page5 = /* @__PURE__ */ __name(() => import("./pages/app.astro.mjs"), "_page5");
var _page6 = /* @__PURE__ */ __name(() => import("./pages/consent.astro.mjs"), "_page6");
var _page7 = /* @__PURE__ */ __name(() => import("./pages/deposit.astro.mjs"), "_page7");
var _page8 = /* @__PURE__ */ __name(() => import("./pages/receive.astro.mjs"), "_page8");
var _page9 = /* @__PURE__ */ __name(() => import("./pages/index.astro.mjs"), "_page9");
var pageMap = /* @__PURE__ */ new Map([
  ["node_modules/.pnpm/@astrojs+cloudflare@12.3.0_@types+node@22.13.11_astro@5.5.3_@types+node@22.13.11_idb-keyval@6_nby3smtscreaddsyf77ehaqdxq/node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", _page0],
  ["src/pages/api/balance/[username].js", _page1],
  ["src/pages/api/pay.js", _page2],
  ["src/pages/api/register.js", _page3],
  ["src/pages/api/withdraw.js", _page4],
  ["src/pages/app.astro", _page5],
  ["src/pages/consent.astro", _page6],
  ["src/pages/deposit.astro", _page7],
  ["src/pages/receive.astro", _page8],
  ["src/pages/index.astro", _page9]
]);
var _manifest = Object.assign(manifest, {
  pageMap,
  serverIslandMap,
  renderers,
  actions,
  middleware: /* @__PURE__ */ __name(() => import("./_astro-internal_middleware.mjs"), "middleware")
});
var _args = void 0;
var _exports = createExports(_manifest);
var __astrojsSsrVirtualEntry = _exports.default;
var _start = "start";
if (_start in serverEntrypointModule) {
  serverEntrypointModule[_start](_manifest, _args);
}
export {
  __astrojsSsrVirtualEntry as default,
  pageMap
};
//# sourceMappingURL=bundledWorker-0.005699871247469179.mjs.map
