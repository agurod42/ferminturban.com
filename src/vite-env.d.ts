/// <reference types="vite/client" />

declare const __IMGPROXY_BASE__: string;
declare const __IMGPROXY_KEY__: string;
declare const __IMGPROXY_SALT__: string;
declare const __IMGPROXY_SIGNATURE_SIZE__: string;

interface Window {
  __APP_CONFIG__?: {
    IMGPROXY_BASE?: string;
    IMGPROXY_KEY?: string;
    IMGPROXY_SALT?: string;
    IMGPROXY_SIGNATURE_SIZE?: string;
  };
}
