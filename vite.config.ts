import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      __IMGPROXY_BASE__: JSON.stringify(
        env.VITE_IMGPROXY_BASE || env.IMGPROXY_BASE || "https://imgproxy.thewisemonkey.co.uk",
      ),
      __IMGPROXY_KEY__: JSON.stringify(env.VITE_IMGPROXY_KEY || env.IMGPROXY_KEY || ""),
      __IMGPROXY_SALT__: JSON.stringify(env.VITE_IMGPROXY_SALT || env.IMGPROXY_SALT || ""),
      __IMGPROXY_SIGNATURE_SIZE__: JSON.stringify(
        env.VITE_IMGPROXY_SIGNATURE_SIZE || env.IMGPROXY_SIGNATURE_SIZE || "32",
      ),
    },
  };
});
