#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-run}"
APP_ARGS=("${@:2}")
APP_NAME="SeisAppleNativeShell"
BUNDLE_ID="com.seis.apple-native-shell"
MIN_SYSTEM_VERSION="13.0"

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
APP_RESOURCES="$APP_CONTENTS/Resources"
APP_BINARY="$APP_MACOS/$APP_NAME"
INFO_PLIST="$APP_CONTENTS/Info.plist"
REPOSITORY_SNAPSHOT="$APP_RESOURCES/seis-repository-surface-snapshot.json"
REPOSITORY_ROOT_ARGS=(--repository-root "$ROOT_DIR" --repository-snapshot "$REPOSITORY_SNAPSHOT")

pkill -x "$APP_NAME" >/dev/null 2>&1 || true

swift build --package-path "$PACKAGE_DIR" --product "$APP_NAME"
BUILD_BINARY="$(swift build --package-path "$PACKAGE_DIR" --show-bin-path)/$APP_NAME"

rm -rf "$APP_BUNDLE"
mkdir -p "$APP_MACOS" "$APP_RESOURCES"
cp "$BUILD_BINARY" "$APP_BINARY"
chmod +x "$APP_BINARY"

count_reference_modules() {
  local source_dir="$ROOT_DIR/apps/web/reference-banks/$1"
  if [[ ! -d "$source_dir" ]]; then
    echo "0"
    return
  fi

  find "$source_dir" -mindepth 2 -maxdepth 2 -name code.html 2>/dev/null | wc -l | tr -d '[:space:]'
}

generate_repository_snapshot() {
  local website_count ubuntu_count total_reference_count generated_at
  website_count="$(count_reference_modules "stitch_yapay_zeka_web_platformu")"
  ubuntu_count="$(count_reference_modules "stitch_web_based_linux_desktop")"
  total_reference_count=$((website_count + ubuntu_count))
  generated_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  cat >"$REPOSITORY_SNAPSHOT" <<SNAPSHOT
{
  "version": 1,
  "generatedAt": "$generated_at",
  "sourceMode": "launcher-generated-public-safe",
  "repositorySignals": [
    {
      "title": "Repository Root",
      "value": "SEIS",
      "detail": "Resolved by build_and_run.sh and passed as --repository-root.",
      "icon": "folder.badge.gearshape",
      "tone": "blue"
    },
    {
      "title": "SEIS App Library",
      "value": "$total_reference_count",
      "detail": "$website_count Website / AI Platform modules and $ubuntu_count Ubuntu Web Desktop modules stay contained as Linux Replica app surfaces.",
      "icon": "square.grid.2x2",
      "tone": "cyan"
    },
    {
      "title": "Apple Native Shell",
      "value": "SwiftPM",
      "detail": "The app bundle carries this snapshot so launch can avoid first-run iCloud repository scanning.",
      "icon": "laptopcomputer",
      "tone": "indigo"
    },
    {
      "title": "Public Safety",
      "value": "No keys",
      "detail": "Snapshot contains counts, labels, and demo-safe metadata only.",
      "icon": "lock.shield",
      "tone": "green"
    }
  ],
  "ecosystemSignals": [
    {
      "title": "Website Lane",
      "value": "$website_count",
      "detail": "stitch_yapay_zeka_web_platformu feeds the Website / AI Platform direction.",
      "icon": "globe",
      "tone": "purple"
    },
    {
      "title": "Ubuntu Lane",
      "value": "$ubuntu_count",
      "detail": "stitch_web_based_linux_desktop feeds the Ubuntu Web Desktop route.",
      "icon": "desktopcomputer",
      "tone": "orange"
    },
    {
      "title": "Demo Boundary",
      "value": "Local",
      "detail": "No SSH, provider calls, deployment actions, or credentials are activated by this snapshot.",
      "icon": "checkmark.shield",
      "tone": "green"
    }
  ],
  "fullStackDesignLanes": [
    {
      "id": "website-ai-platform",
      "title": "Website / AI Platform",
      "badge": "$website_count modules",
      "intent": "Use supplied Stitch website references for the public SEIS web and AI platform direction.",
      "deepLink": "apps/web/seis-linux-replica.html?demo=live&source=website",
      "icon": "sparkles",
      "tone": "purple"
    },
    {
      "id": "ubuntu-web-desktop",
      "title": "Ubuntu Web Desktop",
      "badge": "$ubuntu_count modules",
      "intent": "Use supplied Stitch desktop references for the browser-local Linux-like SEIS route.",
      "deepLink": "apps/web/seis-linux-replica.html?demo=live&source=ubuntu",
      "icon": "desktopcomputer",
      "tone": "orange"
    },
    {
      "id": "apple-native-command-center",
      "title": "Apple Native Command Center",
      "badge": "SwiftPM",
      "intent": "Keep the macOS shell aligned with repo intelligence, demo mode, and public-safe Apple-first metadata.",
      "icon": "macwindow",
      "tone": "blue"
    }
  ]
}
SNAPSHOT
}

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
  <string>SEIS Apple Native</string>
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

generate_repository_snapshot

open_app() {
  if [[ ${#APP_ARGS[@]} -gt 0 ]]; then
    /usr/bin/open -n "$APP_BUNDLE" --args "${REPOSITORY_ROOT_ARGS[@]}" "${APP_ARGS[@]}"
  else
    /usr/bin/open -n "$APP_BUNDLE" --args "${REPOSITORY_ROOT_ARGS[@]}"
  fi
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
  --brain-ssh|brain-ssh)
    APP_ARGS=(--open-panel brain-ssh)
    open_app
    ;;
  --ai-scale|ai-scale)
    APP_ARGS=(--open-panel ai-scale)
    open_app
    ;;
  --app-library|app-library)
    APP_ARGS=(--open-panel app-library)
    open_app
    ;;
  --website-demo-lane|website-demo-lane)
    APP_ARGS=(--open-public-demo-lane website)
    open_app
    ;;
  --ubuntu-demo-lane|ubuntu-demo-lane)
    APP_ARGS=(--open-public-demo-lane ubuntu)
    open_app
    ;;
  --verify|verify)
    open_app
    sleep 1
    pgrep -x "$APP_NAME" >/dev/null
    pkill -x "$APP_NAME" >/dev/null 2>&1 || true
    ;;
  --verify-brain-ssh|verify-brain-ssh)
    APP_ARGS=(--open-panel brain-ssh)
    open_app
    sleep 1
    pgrep -x "$APP_NAME" >/dev/null
    pkill -x "$APP_NAME" >/dev/null 2>&1 || true
    ;;
  --verify-ai-scale|verify-ai-scale)
    APP_ARGS=(--open-panel ai-scale)
    open_app
    sleep 1
    pgrep -x "$APP_NAME" >/dev/null
    pkill -x "$APP_NAME" >/dev/null 2>&1 || true
    ;;
  --verify-app-library|verify-app-library)
    APP_ARGS=(--open-panel app-library)
    open_app
    sleep 1
    pgrep -x "$APP_NAME" >/dev/null
    pkill -x "$APP_NAME" >/dev/null 2>&1 || true
    ;;
  --verify-website-demo-lane|verify-website-demo-lane)
    APP_ARGS=(--open-public-demo-lane website)
    open_app
    sleep 1
    pgrep -x "$APP_NAME" >/dev/null
    pkill -x "$APP_NAME" >/dev/null 2>&1 || true
    ;;
  --verify-ubuntu-demo-lane|verify-ubuntu-demo-lane)
    APP_ARGS=(--open-public-demo-lane ubuntu)
    open_app
    sleep 1
    pgrep -x "$APP_NAME" >/dev/null
    pkill -x "$APP_NAME" >/dev/null 2>&1 || true
    ;;
  *)
    echo "usage: $0 [run|--debug|--logs|--telemetry|--brain-ssh|--ai-scale|--app-library|--website-demo-lane|--ubuntu-demo-lane|--verify|--verify-brain-ssh|--verify-ai-scale|--verify-app-library|--verify-website-demo-lane|--verify-ubuntu-demo-lane]" >&2
    exit 2
    ;;
esac
