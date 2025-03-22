globalThis.process ??= {}; globalThis.process.env ??= {};
import { b as createComponent, f as createAstro, d as renderTemplate, h as renderSlot, e as renderScript, i as renderHead, r as renderComponent, F as Fragment, j as addAttribute, u as unescapeHTML } from './astro/server_Co4SjOCG.mjs';
/* empty css                       */

const pwaInfo = {"pwaInDevEnvironment":false,"webManifest":{"href":"/manifest.webmanifest","useCredentials":false,"linkTag":"<link rel=\"manifest\" href=\"/manifest.webmanifest\">"}};

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  return renderTemplate(_a || (_a = __template(['<html lang="en" data-astro-cid-sckkx6r4> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"', '><title>Face Recognition System</title><script type="module" src="https://cdn.jsdelivr.net/npm/@vladmandic/human@3.2.0/dist/human.esm.min.js"><\/script><script src="/src/pwa.ts" type="module"><\/script>', "", "</head> <body data-astro-cid-sckkx6r4> ", " ", " </body></html>"])), addAttribute(Astro2.generator, "content"), pwaInfo && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${unescapeHTML(pwaInfo.webManifest.linkTag)}` })}`, renderHead(), renderScript($$result, "/Users/junyaoc/Documents/lab/mukapay-client/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts"), renderSlot($$result, $$slots["default"]));
}, "/Users/junyaoc/Documents/lab/mukapay-client/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
