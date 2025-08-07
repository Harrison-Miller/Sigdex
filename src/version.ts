export const devVariantName = 'ocr';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const SIGDEX_VERSION = devVariantName ? `${__APP_VERSION__}-${devVariantName}` : __APP_VERSION__;
