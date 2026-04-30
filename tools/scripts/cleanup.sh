#!/bin/bash
# =============================================================================
# cleanup.sh
# plck-main のビルド遺産を掃除する
#
# 削除対象:
#  - plck-main 直下の *.zip （LMS用Zipは講座フォルダの LMS搭載用ZIP/ に配置済想定）
#  - plck-main 直下のユニット名フォルダ（古い plck の遺産）
# 保持対象:
#  - dist/ （現行ビルド、 plck build で再生成可）
#  - contents/, core/, node_modules/, package.json 等（ソース）
# =============================================================================
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLCK="$(cd "$SCRIPT_DIR/../../plck-main" && pwd)"

echo "Cleaning up $PLCK ..."
BEFORE=$(du -sh "$PLCK" 2>/dev/null | cut -f1)

# 1. root zip files
rm -f "$PLCK"/*.zip 2>/dev/null || true

# 2. root unit folders (nested stale builds)
for d in "$PLCK"/*; do
    name=$(basename "$d")
    case "$name" in
        privacy-unit[1234]|security-unit[1234]|unit-sample|*-logistics0[1-9]-unit0[0-9])
            [ -d "$d" ] && rm -rf "$d"
            ;;
    esac
done

AFTER=$(du -sh "$PLCK" 2>/dev/null | cut -f1)
echo "  Before: $BEFORE"
echo "  After:  $AFTER"
echo "OK"
