import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: command === 'build' ? '/sigdex/' : '/',
  test: {
    setupFiles: ['vitest-localstorage-mock'],
    mockReset: false,
  },
}));
