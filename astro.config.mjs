// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://teipsum.com',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    // Keep every stylesheet and script external so the Content-Security-Policy
    // can stay at 'self' with no inline allowances.
    inlineStylesheets: 'never',
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
      cssCodeSplit: false,
    },
  },
});
