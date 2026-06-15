#!/usr/bin/env zsh
# SEIS Release Policy — Zsh Shell Script
# Motion policy resolution and deploy gate validation

# ─── Motion Duration Map (Zsh associative array) ─────────────────────────────
typeset -A MOTION_DURATIONS_FULL=(
  instant   0
  fast      150
  standard  300
  slow      500
  cinematic 800
)

typeset -A MOTION_DURATIONS_REDUCED=(
  instant   0
  fast      0
  standard  0
  slow      0
  cinematic 0
)

# ─── Badge Color Map ──────────────────────────────────────────────────────────
typeset -A BADGE_COLORS=(
  ready   '\033[32m'   # green
  pending '\033[33m'   # yellow
  blocked '\033[31m'   # red
  draft   '\033[37m'   # grey
)
typeset -r COLOR_RESET='\033[0m'

# ─── Motion Mode Resolution ───────────────────────────────────────────────────
# Reads SEIS_MOTION_MODE env var; falls back to system preference detection.
resolve_motion_mode() {
  if [[ -n "${SEIS_MOTION_MODE}" ]]; then
    echo "${SEIS_MOTION_MODE}"
    return 0
  fi

  # Check macOS system preference via osascript if available
  if command -v osascript &>/dev/null; then
    local reduce_setting
    reduce_setting=$(osascript -e \
      'tell application "System Events" to get reduce motion of accessibility preferences' \
      2>/dev/null)
    if [[ "${reduce_setting}" == "true" ]]; then
      echo "reduced"
      return 0
    fi
  fi

  # Check Linux/GNOME accessibility preference
  if command -v gsettings &>/dev/null; then
    local gtk_reduce
    gtk_reduce=$(gsettings get org.gnome.desktop.interface enable-animations 2>/dev/null)
    if [[ "${gtk_reduce}" == "false" ]]; then
      echo "reduced"
      return 0
    fi
  fi

  echo "full"
}

# ─── Get Motion Duration ─────────────────────────────────────────────────────
motion_duration_ms() {
  local token="${1:-standard}"
  local mode
  mode=$(resolve_motion_mode)

  if [[ "${mode}" == "reduced" ]]; then
    echo "${MOTION_DURATIONS_REDUCED[${token}]:-0}"
  else
    echo "${MOTION_DURATIONS_FULL[${token}]:-300}"
  fi
}

# ─── Print Release Badge ─────────────────────────────────────────────────────
print_release_badge() {
  local status="${1:-unknown}"
  local color="${BADGE_COLORS[${status}]:-\033[37m}"
  printf "${color}[%s]${COLOR_RESET}\n" "${status:u}"
}

# ─── Release Gate Validation ──────────────────────────────────────────────────
run_release_gate() {
  local version="${1:-unknown}"
  local -a failed_checks=()

  print -P "%F{cyan}SEIS Release Gate — ${version}%f"
  print -- "─────────────────────────────────────"

  # Check: typecheck
  if npm run typecheck --silent 2>/dev/null; then
    print -P "  %F{green}✓%f  typecheck"
  else
    print -P "  %F{red}✗%f  typecheck"
    failed_checks+=("typecheck")
  fi

  # Check: lint
  if npm run lint --silent 2>/dev/null; then
    print -P "  %F{green}✓%f  lint"
  else
    print -P "  %F{red}✗%f  lint"
    failed_checks+=("lint")
  fi

  # Check: content validation
  if npm run check:content --silent 2>/dev/null; then
    print -P "  %F{green}✓%f  content validation"
  else
    print -P "  %F{red}✗%f  content validation"
    failed_checks+=("content validation")
  fi

  print -- "─────────────────────────────────────"

  if (( ${#failed_checks[@]} == 0 )); then
    print -P "%F{green}✓ All checks passed — ready to deploy.%f"
    print_release_badge "ready"
    return 0
  else
    print -P "%F{red}✗ ${#failed_checks[@]} check(s) failed — deploy blocked.%f"
    print -P "  Failed: %F{red}${(j:, :)failed_checks}%f"
    print_release_badge "blocked"
    return 1
  fi
}

# ─── Main ─────────────────────────────────────────────────────────────────────
if [[ "${ZSH_ARGZERO}" == "${0}" ]]; then
  local mode
  mode=$(resolve_motion_mode)
  print "Motion mode:    ${mode}"
  print "Standard duration: $(motion_duration_ms standard)ms"
  print "Fast duration:     $(motion_duration_ms fast)ms"
fi
