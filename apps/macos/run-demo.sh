#!/usr/bin/env bash
# SEIS — macOS demo launcher.
#
# Runs the portfolio (apps/web) two ways so you can see how it behaves:
#   web   — serve it and open your default browser   (macOS website demo)
#   app   — serve it and open a native WKWebView app (macOS app demo)
#   both  — do both (default)
#
# macOS only: uses `open`, and the `app`/`both` modes need a Swift toolchain
# (Xcode CLT). The site fetches translations.json/site-config.json, so it is
# served over http://localhost rather than file:// to avoid CORS failures.
set -euo pipefail

MODE="${1:-both}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
WEB_DIR="$ROOT/apps/web"
PKG_DIR="$HERE/PortfolioDemo"
APP_NAME="SeisPortfolioDemo"

command -v python3 >/dev/null 2>&1 || { echo "error: python3 is required to serve the site" >&2; exit 1; }

PORT="${SEIS_DEMO_PORT:-$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1]); s.close()')}"
URL="http://localhost:${PORT}/"

echo "▸ Serving ${WEB_DIR}"
echo "  at ${URL}"
python3 -m http.server "$PORT" --directory "$WEB_DIR" >/tmp/seis-macos-demo-server.log 2>&1 &
SERVER_PID=$!
cleanup() { kill "$SERVER_PID" >/dev/null 2>&1 || true; }
trap cleanup EXIT

for _ in $(seq 1 30); do
    curl -fsS "$URL" >/dev/null 2>&1 && break
    sleep 0.2
done

open_browser() {
    if command -v open >/dev/null 2>&1; then
        open "$URL"
    else
        echo "  open ${URL} in your browser"
    fi
}

build_and_open_app() {
    if ! command -v swift >/dev/null 2>&1; then
        echo "warning: no Swift toolchain found — skipping native app. Install Xcode Command Line Tools." >&2
        return 0
    fi
    echo "▸ Building ${APP_NAME} …"
    swift build --package-path "$PKG_DIR" --product "$APP_NAME"
    local bin_dir bin app contents
    bin_dir="$(swift build --package-path "$PKG_DIR" --show-bin-path)"
    bin="${bin_dir}/${APP_NAME}"
    app="${HERE}/dist/${APP_NAME}.app"
    contents="${app}/Contents"
    rm -rf "$app"
    mkdir -p "${contents}/MacOS"
    cp "$bin" "${contents}/MacOS/${APP_NAME}"
    chmod +x "${contents}/MacOS/${APP_NAME}"
    mkdir -p "${contents}/Resources"
    if command -v sips >/dev/null 2>&1 && command -v iconutil >/dev/null 2>&1 && [ -f "$ROOT/apps/web/icons/icon-512.png" ]; then
        local iconset
        iconset="$(mktemp -d)/AppIcon.iconset"
        mkdir -p "$iconset"
        local sz
        for sz in 16 32 128 256 512; do
            sips -z "$sz" "$sz" "$ROOT/apps/web/icons/icon-512.png" --out "$iconset/icon_${sz}x${sz}.png" >/dev/null 2>&1 || true
            sips -z "$((sz * 2))" "$((sz * 2))" "$ROOT/apps/web/icons/icon-512.png" --out "$iconset/icon_${sz}x${sz}@2x.png" >/dev/null 2>&1 || true
        done
        iconutil -c icns "$iconset" -o "${contents}/Resources/AppIcon.icns" >/dev/null 2>&1 || true
    fi
    cat >"${contents}/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key><string>${APP_NAME}</string>
  <key>CFBundleIdentifier</key><string>com.seis.portfolio-demo</string>
  <key>CFBundleName</key><string>SEIS Portfolio Demo</string>
  <key>CFBundleIconFile</key><string>AppIcon</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>LSMinimumSystemVersion</key><string>12.0</string>
  <key>NSPrincipalClass</key><string>NSApplication</string>
  <key>SEISDemoURL</key><string>${URL}</string>
  <key>NSAppTransportSecurity</key>
  <dict><key>NSAllowsLocalNetworking</key><true/></dict>
</dict>
</plist>
PLIST
    echo "▸ Launching native macOS app …"
    open -n "$app"
}

case "$MODE" in
    web)
        open_browser
        echo "▸ Browser demo running. Press Ctrl+C to stop the server."
        wait "$SERVER_PID"
        ;;
    app)
        build_and_open_app
        echo "▸ App demo running. Press Ctrl+C to stop the server."
        wait "$SERVER_PID"
        ;;
    both)
        open_browser
        build_and_open_app
        echo "▸ Browser + app demos running. Press Ctrl+C to stop the server."
        wait "$SERVER_PID"
        ;;
    *)
        echo "usage: $0 [app|web|both]" >&2
        exit 2
        ;;
esac
