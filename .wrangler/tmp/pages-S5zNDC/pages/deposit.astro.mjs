globalThis.process ??= {}; globalThis.process.env ??= {};
import { b as createComponent, r as renderComponent, d as renderTemplate, e as renderScript } from '../chunks/astro/server_Co4SjOCG.mjs';
import { $ as $$Layout } from '../chunks/Layout_Ca_sYZF3.mjs';
export { renderers } from '../renderers.mjs';

const $$Deposit = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${renderScript($$result2, "/Users/junyaoc/Documents/lab/mukapay-client/src/pages/deposit.astro?astro&type=script&index=0&lang.ts")} ${renderComponent($$result2, "DepositVue", null, { "client:only": "vue", "client:component-hydration": "only", "client:component-path": "/Users/junyaoc/Documents/lab/mukapay-client/src/components/Deposit.vue", "client:component-export": "default" })} ` })}`;
}, "/Users/junyaoc/Documents/lab/mukapay-client/src/pages/deposit.astro", void 0);

const $$file = "/Users/junyaoc/Documents/lab/mukapay-client/src/pages/deposit.astro";
const $$url = "/deposit";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Deposit,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
