#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-run}"
APP_NAME="SeisAppleNativeShell"
BUNDLE_ID="com.seis.apple-native-shell"
DISPLAY_NAME="SEIS Apple Native"
MIN_SYSTEM_VERSION="13.0"

if [[ "$MODE" == "--ai-demo" || "$MODE" == "ai-demo" ]]; then
  APP_NAME="SeisAICommandCore"
  BUNDLE_ID="com.seis.ai-command-core"
  DISPLAY_NAME="SEIS AI Command Core"
  MODE="${2:-run}"
fi

if [[ -n "${SWIFT_BIN:-}" ]] && ! command -v "$SWIFT_BIN" >/dev/null 2>&1; then
    echo "warning: Provided SWIFT_BIN is not executable: $SWIFT_BIN" >&2
    SWIFT_BIN=""
fi

resolve_swift_binary() {
  local candidate
  for candidate in "${SWIFT_BIN:-}" /usr/bin/swift swift; do
    [[ -z "$candidate" ]] && continue
    if command -v "$candidate" >/dev/null 2>&1; then
      if "$candidate" --version >/dev/null 2>&1; then
        echo "$candidate"
        return 0
      fi
    fi
  done

  return 1
}

SWIFT_BIN="$(resolve_swift_binary)"
if [[ -z "$SWIFT_BIN" ]]; then
  echo "error: Swift toolchain not available" >&2
  echo "Set SWIFT_BIN env var or install a working Swift executable." >&2
  exit 1
fi

swift() {
  "$SWIFT_BIN" "$@"
}

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGE_DIR="$ROOT_DIR/packages/seis_platform_swift"
DIST_DIR="$ROOT_DIR/dist"
APP_BUNDLE="$DIST_DIR/$APP_NAME.app"
APP_CONTENTS="$APP_BUNDLE/Contents"
APP_MACOS="$APP_CONTENTS/MacOS"
APP_BINARY="$APP_MACOS/$APP_NAME"
INFO_PLIST="$APP_CONTENTS/Info.plist"

pkill -x "$APP_NAME" >/dev/null 2>&1 || true

swift build --package-path "$PACKAGE_DIR" --product "$APP_NAME"
BUILD_BINARY="$(swift build --package-path "$PACKAGE_DIR" --show-bin-path)/$APP_NAME"

rm -rf "$APP_BUNDLE"
mkdir -p "$APP_MACOS"
cp "$BUILD_BINARY" "$APP_BINARY"
chmod +x "$APP_BINARY"

cat >"$INFO_PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key>
  <string>$APP_NAME</string>
  <key>CFBundleIdentifier</key>
  <string>$BUNDLE_ID</string>
  <key>CFBundleName</key>
  <string>$DISPLAY_NAME</string>
  <key>CFBundleURLTypes</key>
  <array>
    <dict>
      <key>CFBundleURLName</key>
      <string>seis.demo</string>
      <key>CFBundleURLSchemes</key>
      <array>
        <string>seisdemo</string>
      </array>
    </dict>
  </array>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>LSMinimumSystemVersion</key>
  <string>$MIN_SYSTEM_VERSION</string>
  <key>NSPrincipalClass</key>
  <string>NSApplication</string>
</dict>
</plist>
PLIST

open_app() {
  /usr/bin/open -n "$APP_BUNDLE"
}

case "$MODE" in
  run)
    open_app
    ;;
  --debug|debug)
    lldb -- "$APP_BINARY"
    ;;
  --logs|logs)
    open_app
    /usr/bin/log stream --info --style compact --predicate "process == \"$APP_NAME\""
    ;;
  --telemetry|telemetry)
    open_app
    /usr/bin/log stream --info --style compact --predicate "subsystem == \"$BUNDLE_ID\""
    ;;
  --verify|verify)
    open_app
    sleep 1
    pgrep -x "$APP_NAME" >/dev/null
    pkill -x "$APP_NAME" >/dev/null 2>&1 || true
    ;;
  *)
    echo "usage: $0 [run|--debug|--logs|--telemetry|--verify|--ai-demo [run|--verify]]" >&2
    exit 2
    ;;
esac
