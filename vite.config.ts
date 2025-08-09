import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import pkg from './package.json';
import { VitePWA } from 'vite-plugin-pwa';

const devVariantName = '';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: devVariantName ? `Sigdex - ${devVariantName}` : 'Sigdex',
        short_name: devVariantName ? `Sigdex - ${devVariantName}` : 'Sigdex',
        background_color: '#000000',
        theme_color: '#a10000',
        icons: [
          {
            src: '/assets/icon192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/assets/icon512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /.*\.(?:js|css|html|json|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot|ico|webp|avif)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'network-first-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\.github\.com\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'github-api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'github-raw-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/pdfdata\.sigdex\.io\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pdfdata-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/data\.sigdex\.io\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'data-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  base: command === 'build' ? '/' : '/',
  server: {
    proxy: {
      '/api/faq': {
        target: 'https://pdfdata.sigdex.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/faq/, '/data/faq.json')
      }
    }
  },
  test: {
    setupFiles: ['vitest-localstorage-mock'],
    mockReset: false,
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __DEV_VARIANT_NAME__: JSON.stringify(devVariantName),
  },
}));
