globalThis.process ??= {}; globalThis.process.env ??= {};
import { b as createComponent, r as renderComponent, d as renderTemplate, e as renderScript } from '../chunks/astro/server_Co4SjOCG.mjs';
import { $ as $$Layout } from '../chunks/Layout_Ca_sYZF3.mjs';
export { renderers } from '../renderers.mjs';

const $$App = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` <link rel="preconnect" href="https://fonts.googleapis.com"> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> <link href="https://fonts.googleapis.com/css2?family=Doto:wght@100..900&family=Lexend:wght@100..900&display=swap" rel="stylesheet"> ${renderScript($$result2, "/Users/junyaoc/Documents/lab/mukapay-client/src/pages/app.astro?astro&type=script&index=0&lang.ts")}   ` })}`;
}, "/Users/junyaoc/Documents/lab/mukapay-client/src/pages/app.astro", void 0);

const $$file = "/Users/junyaoc/Documents/lab/mukapay-client/src/pages/app.astro";
const $$url = "/app";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$App,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
