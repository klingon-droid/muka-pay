globalThis.process ??= {}; globalThis.process.env ??= {};
import { k as decodeKey } from './chunks/astro/server_Co4SjOCG.mjs';
import './chunks/astro-designed-error-pages_D_wLCTY8.mjs';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/noop-middleware_C2R1VtuH.mjs';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/junyaoc/Documents/lab/mukapay-client/","cacheDir":"file:///Users/junyaoc/Documents/lab/mukapay-client/node_modules/.astro/","outDir":"file:///Users/junyaoc/Documents/lab/mukapay-client/dist/","srcDir":"file:///Users/junyaoc/Documents/lab/mukapay-client/src/","publicDir":"file:///Users/junyaoc/Documents/lab/mukapay-client/public/","buildClientDir":"file:///Users/junyaoc/Documents/lab/mukapay-client/dist/","buildServerDir":"file:///Users/junyaoc/Documents/lab/mukapay-client/dist/_worker.js/","adapterName":"@astrojs/cloudflare","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/.pnpm/@astrojs+cloudflare@12.3.0_@types+node@22.13.11_astro@5.5.3_@types+node@22.13.11_idb-keyval@6_nby3smtscreaddsyf77ehaqdxq/node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/balance/[username]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/balance\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"balance","dynamic":false,"spread":false}],[{"content":"username","dynamic":true,"spread":false}]],"params":["username"],"component":"src/pages/api/balance/[username].js","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/pay","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/pay\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"pay","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/pay.js","pathname":"/api/pay","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/register","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/register\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"register","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/register.js","pathname":"/api/register","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/withdraw","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/withdraw\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"withdraw","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/withdraw.js","pathname":"/api/withdraw","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/app.DWHplSFq.css"}],"routeData":{"route":"/app","isIndex":false,"type":"page","pattern":"^\\/app\\/?$","segments":[[{"content":"app","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/app.astro","pathname":"/app","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/app.DWHplSFq.css"},{"type":"inline","content":".font-lexend{font-family:Lexend,sans-serif;font-optical-sizing:auto;font-weight:400;font-style:normal;font-variation-settings:\"wdth\" 100}.font-doto{font-family:Doto,sans-serif;font-optical-sizing:auto;font-weight:900;font-style:normal;font-variation-settings:\"wdth\" 100}.animate-fade-in{animation:fadeIn .8s ease-out}@keyframes fadeIn{0%{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.active\\:scale-98:active{transform:scale(.98)}\n"}],"routeData":{"route":"/consent","isIndex":false,"type":"page","pattern":"^\\/consent\\/?$","segments":[[{"content":"consent","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/consent.astro","pathname":"/consent","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/app.DWHplSFq.css"},{"type":"inline","content":".font-lexend{font-family:Lexend,sans-serif;font-optical-sizing:auto;font-weight:400;font-style:normal;font-variation-settings:\"wdth\" 100}.font-doto{font-family:Doto,sans-serif;font-optical-sizing:auto;font-weight:400;font-style:normal;font-variation-settings:\"wdth\" 100}\n"}],"routeData":{"route":"/deposit","isIndex":false,"type":"page","pattern":"^\\/deposit\\/?$","segments":[[{"content":"deposit","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/deposit.astro","pathname":"/deposit","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/app.DWHplSFq.css"},{"type":"inline","content":".font-lexend{font-family:Lexend,sans-serif;font-optical-sizing:auto;font-weight:400;font-style:normal;font-variation-settings:\"wdth\" 100}.font-doto{font-family:Doto,sans-serif;font-optical-sizing:auto;font-weight:400;font-style:normal;font-variation-settings:\"wdth\" 100}\n"}],"routeData":{"route":"/receive","isIndex":false,"type":"page","pattern":"^\\/receive\\/?$","segments":[[{"content":"receive","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/receive.astro","pathname":"/receive","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/app.DWHplSFq.css"},{"type":"inline","content":".font-lexend{font-family:Lexend,sans-serif;font-optical-sizing:auto;font-weight:400;font-style:normal;font-variation-settings:\"wdth\" 100}.font-doto{font-family:Doto,sans-serif;font-optical-sizing:auto;font-weight:400;font-style:normal;font-variation-settings:\"wdth\" 100}\n.font-doto{font-family:Doto,sans-serif;font-optical-sizing:auto;font-weight:400;font-style:normal;font-variation-settings:\"wdth\" 100}.font-lexend{font-family:Lexend,sans-serif;font-optical-sizing:auto;font-weight:400;font-style:normal;font-variation-settings:\"wdth\" 100}.font-doto{font-family:Doto,sans-serif;font-optical-sizing:auto;font-weight:600;font-style:normal;font-variation-settings:\"wdth\" 100}\n"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/junyaoc/Documents/lab/mukapay-client/src/pages/app.astro",{"propagation":"none","containsHead":true}],["/Users/junyaoc/Documents/lab/mukapay-client/src/pages/consent.astro",{"propagation":"none","containsHead":true}],["/Users/junyaoc/Documents/lab/mukapay-client/src/pages/deposit.astro",{"propagation":"none","containsHead":true}],["/Users/junyaoc/Documents/lab/mukapay-client/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/junyaoc/Documents/lab/mukapay-client/src/pages/receive.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000@astro-page:node_modules/.pnpm/@astrojs+cloudflare@12.3.0_@types+node@22.13.11_astro@5.5.3_@types+node@22.13.11_idb-keyval@6_nby3smtscreaddsyf77ehaqdxq/node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/api/balance/[username]@_@js":"pages/api/balance/_username_.astro.mjs","\u0000@astro-page:src/pages/api/pay@_@js":"pages/api/pay.astro.mjs","\u0000@astro-page:src/pages/api/register@_@js":"pages/api/register.astro.mjs","\u0000@astro-page:src/pages/api/withdraw@_@js":"pages/api/withdraw.astro.mjs","\u0000@astro-page:src/pages/app@_@astro":"pages/app.astro.mjs","\u0000@astro-page:src/pages/consent@_@astro":"pages/consent.astro.mjs","\u0000@astro-page:src/pages/deposit@_@astro":"pages/deposit.astro.mjs","\u0000@astro-page:src/pages/receive@_@astro":"pages/receive.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"index.js","\u0000@astro-renderers":"renderers.mjs","\u0000noop-actions":"_noop-actions.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_B8nECSVu.mjs","/Users/junyaoc/Documents/lab/mukapay-client/src/pages/app.astro?astro&type=script&index=0&lang.ts":"_astro/app.astro_astro_type_script_index_0_lang.1TishdO7.js","/Users/junyaoc/Documents/lab/mukapay-client/src/pages/deposit.astro?astro&type=script&index=0&lang.ts":"_astro/deposit.astro_astro_type_script_index_0_lang.Bdi9yq1G.js","/Users/junyaoc/Documents/lab/mukapay-client/src/pages/receive.astro?astro&type=script&index=0&lang.ts":"_astro/receive.astro_astro_type_script_index_0_lang.Bdi9yq1G.js","/Users/junyaoc/Documents/lab/mukapay-client/src/pages/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.CnZKue0i.js","/Users/junyaoc/Documents/lab/mukapay-client/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts":"_astro/Layout.astro_astro_type_script_index_0_lang.DMYlpbx-.js","/Users/junyaoc/Documents/lab/mukapay-client/src/components/Consent.vue":"_astro/Consent.Da-CDsea.js","@astrojs/vue/client.js":"_astro/client.CyQLApk6.js","/Users/junyaoc/Documents/lab/mukapay-client/node_modules/.pnpm/viem@2.23.13_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.24.2/node_modules/viem/_esm/utils/ccip.js":"_astro/ccip.DsaWumhY.js","/Users/junyaoc/Documents/lab/mukapay-client/node_modules/.pnpm/@noble+curves@1.8.1/node_modules/@noble/curves/esm/secp256k1.js":"_astro/secp256k1.D9I2ftlh.js","/Users/junyaoc/Documents/lab/mukapay-client/src/components/Wallet2.vue":"_astro/Wallet2.BkvG2MmN.js","/Users/junyaoc/Documents/lab/mukapay-client/src/components/Deposit.vue":"_astro/Deposit.C0Pivuro.js","/Users/junyaoc/Documents/lab/mukapay-client/src/components/Receive2.vue":"_astro/Receive2.BJMDv7E0.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/Users/junyaoc/Documents/lab/mukapay-client/src/pages/app.astro?astro&type=script&index=0&lang.ts","window.location.href=\"/\";"]],"assets":["/_astro/app.DWHplSFq.css","/circuit.wasm","/circuit_final.zkey","/favicon.svg","/logo.png","/manifest.json","/manifest.webmanifest","/pwa-192x192.png","/pwa-512x512.png","/registerSW.js","/sw.js","/workbox-d32cb9a2.js","/_astro/Consent.Da-CDsea.js","/_astro/Deposit.C0Pivuro.js","/_astro/Deposit.ZGc7ja49.js","/_astro/Layout.astro_astro_type_script_index_0_lang.DMYlpbx-.js","/_astro/Receive2.8D6TKVa4.js","/_astro/Receive2.BJMDv7E0.js","/_astro/Wallet2.BkvG2MmN.js","/_astro/_plugin-vue_export-helper.DlAUqK2U.js","/_astro/ccip.DsaWumhY.js","/_astro/client.CyQLApk6.js","/_astro/deposit.astro_astro_type_script_index_0_lang.Bdi9yq1G.js","/_astro/index.CUfVMB53.js","/_astro/index.ClfaVKLN.js","/_astro/index.astro_astro_type_script_index_0_lang.CnZKue0i.js","/_astro/receive.astro_astro_type_script_index_0_lang.Bdi9yq1G.js","/_astro/runtime-core.esm-bundler.Bwuu-wic.js","/_astro/runtime-dom.esm-bundler.BcoDJAug.js","/_astro/secp256k1.D9I2ftlh.js","/_astro/user.DFJTKVVf.js","/_worker.js/_@astrojs-ssr-adapter.mjs","/_worker.js/_astro-internal_middleware.mjs","/_worker.js/_noop-actions.mjs","/_worker.js/index.js","/_worker.js/manifest.webmanifest","/_worker.js/registerSW.js","/_worker.js/renderers.mjs","/models/antispoof.bin","/models/antispoof.json","/models/blazeface.bin","/models/blazeface.json","/models/centernet.bin","/models/centernet.json","/models/emotion.bin","/models/emotion.json","/models/face_landmark_68_model-shard1","/models/face_landmark_68_model-weights_manifest.json","/models/face_landmark_68_tiny_model-shard1","/models/face_landmark_68_tiny_model-weights_manifest.json","/models/face_recognition_model-shard1","/models/face_recognition_model-shard2","/models/face_recognition_model-weights_manifest.json","/models/facemesh.bin","/models/facemesh.json","/models/faceres.bin","/models/faceres.json","/models/handlandmark-lite.bin","/models/handlandmark-lite.json","/models/handtrack.bin","/models/handtrack.json","/models/iris.bin","/models/iris.json","/models/liveness.bin","/models/liveness.json","/models/models.json","/models/movenet-lightning.bin","/models/movenet-lightning.json","/models/ssd_mobilenetv1_model-shard1","/models/ssd_mobilenetv1_model-shard2","/models/ssd_mobilenetv1_model-weights_manifest.json","/_worker.js/_astro/app.DWHplSFq.css","/_worker.js/chunks/Layout_Ca_sYZF3.mjs","/_worker.js/chunks/_@astrojs-ssr-adapter_CQRtlbj1.mjs","/_worker.js/chunks/_noop-actions_Dk2yPKP3.mjs","/_worker.js/chunks/astro-designed-error-pages_D_wLCTY8.mjs","/_worker.js/chunks/astro_D6ynNf5y.mjs","/_worker.js/chunks/index_BWSqsUcd.mjs","/_worker.js/chunks/noop-middleware_C2R1VtuH.mjs","/_worker.js/chunks/user_DAjbdjWD.mjs","/_worker.js/pages/_image.astro.mjs","/_worker.js/pages/app.astro.mjs","/_worker.js/pages/consent.astro.mjs","/_worker.js/pages/deposit.astro.mjs","/_worker.js/pages/index.astro.mjs","/_worker.js/pages/receive.astro.mjs","/_worker.js/chunks/astro/server_Co4SjOCG.mjs","/_worker.js/pages/api/pay.astro.mjs","/_worker.js/pages/api/register.astro.mjs","/_worker.js/pages/api/withdraw.astro.mjs","/_worker.js/pages/api/balance/_username_.astro.mjs"],"buildFormat":"directory","checkOrigin":true,"serverIslandNameMap":[],"key":"FE/jgw7ru7qzCF5YSaJUp8K4KugFqpwxGUv4mEdOeQs="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
