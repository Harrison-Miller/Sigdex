declare module 'vite-plugin-pwa' {
    import { Plugin } from 'vite';

    export interface VitePWAOptions {
        registerType?: 'prompt' | 'autoUpdate';
        workbox?: {
            runtimeCaching?: Array<{
                urlPattern: RegExp;
                handler: 'NetworkFirst' | 'CacheFirst' | 'StaleWhileRevalidate' | 'NetworkOnly' | 'CacheOnly';
                options?: {
                    cacheName?: string;
                    networkTimeoutSeconds?: number;
                    expiration?: {
                        maxEntries?: number;
                        maxAgeSeconds?: number;
                    };
                    cacheableResponse?: {
                        statuses?: number[];
                    };
                };
            }>;
        };
    }

    export function VitePWA(options?: VitePWAOptions): Plugin;
}
