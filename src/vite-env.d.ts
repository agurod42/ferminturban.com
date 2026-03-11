/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __IMGPROXY_BASE__: string;
declare const __IMGPROXY_KEY__: string;
declare const __IMGPROXY_SALT__: string;
declare const __IMGPROXY_SIGNATURE_SIZE__: string;

interface Window {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
  __APP_CONFIG__?: {
    IMGPROXY_BASE?: string;
    IMGPROXY_KEY?: string;
    IMGPROXY_SALT?: string;
    IMGPROXY_SIGNATURE_SIZE?: string;
  };
}
