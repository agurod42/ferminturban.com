#!/bin/sh
set -eu

RUNTIME_CONFIG_PATH="/usr/share/nginx/html/runtime-config.js"

escape_js() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

IMGPROXY_BASE_VALUE="${IMGPROXY_BASE:-${VITE_IMGPROXY_BASE:-https://imgproxy.thewisemonkey.co.uk}}"
IMGPROXY_KEY_VALUE="${IMGPROXY_KEY:-${VITE_IMGPROXY_KEY:-}}"
IMGPROXY_SALT_VALUE="${IMGPROXY_SALT:-${VITE_IMGPROXY_SALT:-}}"
IMGPROXY_SIGNATURE_SIZE_VALUE="${IMGPROXY_SIGNATURE_SIZE:-${VITE_IMGPROXY_SIGNATURE_SIZE:-32}}"

cat > "${RUNTIME_CONFIG_PATH}" <<EOF
window.__APP_CONFIG__ = {
  IMGPROXY_BASE: "$(escape_js "${IMGPROXY_BASE_VALUE}")",
  IMGPROXY_KEY: "$(escape_js "${IMGPROXY_KEY_VALUE}")",
  IMGPROXY_SALT: "$(escape_js "${IMGPROXY_SALT_VALUE}")",
  IMGPROXY_SIGNATURE_SIZE: "$(escape_js "${IMGPROXY_SIGNATURE_SIZE_VALUE}")",
};
EOF
