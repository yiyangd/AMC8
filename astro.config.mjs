import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://yiyangd.github.io',
  base: '/AMC8',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
