import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import pkg from './package.json';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: command === 'build' ? '/' : '/',
  test: {
    setupFiles: ['vitest-localstorage-mock'],
    mockReset: false,
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
}));
