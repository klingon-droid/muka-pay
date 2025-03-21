// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  integrations: [vue({
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag === 'iconify-icon',
      },
    },
  })],

  output: 'server',

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare()
});