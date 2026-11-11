#!/bin/bash
# Claude Code PostToolUse hook: runs Prettier on a file right after Claude edits it.
# Only files inside web/ or studio/ are formatted, using that folder's own Prettier
# and config. Exit code 2 sends Prettier's error back to Claude.

root="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
file=$(jq -r '.tool_input.file_path // empty')
[ -n "$file" ] && [ -f "$file" ] || exit 0

case "$file" in
  "$root"/web/*) dir="$root/web" ;;
  "$root"/studio/*) dir="$root/studio" ;;
  *) exit 0 ;;
esac

# Skip installed packages and build output.
case "$file" in
  */node_modules/* | */dist/* | */.astro/* | */.sanity/*) exit 0 ;;
esac

# fnm only loads in interactive shells, so load it here when node is missing.
if ! command -v node >/dev/null 2>&1; then
  PATH="/opt/homebrew/bin:$PATH"
  command -v fnm >/dev/null 2>&1 && eval "$(fnm env)"
fi
command -v node >/dev/null 2>&1 || exit 0

cd "$dir" || exit 0
# --ignore-unknown skips file types Prettier doesn't handle (images, .sh, ...).
if ! out=$(npx --no -- prettier --write --ignore-unknown --log-level warn "${file#"$dir"/}" 2>&1); then
  echo "Prettier couldn't format ${file#"$root"/}:" >&2
  echo "$out" >&2
  exit 2
fi
exit 0
