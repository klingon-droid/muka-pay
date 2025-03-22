globalThis.process ??= {}; globalThis.process.env ??= {};
import { b as createComponent, f as createAstro, r as renderComponent, d as renderTemplate, e as renderScript } from '../chunks/astro/server_Co4SjOCG.mjs';
import { $ as $$Layout } from '../chunks/Layout_Ca_sYZF3.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` <link rel="preconnect" href="https://fonts.googleapis.com"> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&family=Doto:wght@600&display=swap" rel="stylesheet"> ${renderScript($$result2, "/Users/junyaoc/Documents/lab/mukapay-client/src/pages/index.astro?astro&type=script&index=0&lang.ts")}   ${renderComponent($$result2, "Wallet2", null, { "client:only": "vue", "client:component-hydration": "only", "client:component-path": "/Users/junyaoc/Documents/lab/mukapay-client/src/components/Wallet2.vue", "client:component-export": "default" })}  ` })}`;
}, "/Users/junyaoc/Documents/lab/mukapay-client/src/pages/index.astro", void 0);

const $$file = "/Users/junyaoc/Documents/lab/mukapay-client/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
