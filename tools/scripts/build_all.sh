#!/usr/bin/env bash
# =============================================================================
# build_all.sh
#   事前チェック → クリーンビルド → ZIP生成 → ZIP検証 を一本化。
#   どの段階でも異常検出で即停止する（set -e）。
#
# 流れ:
#   1. preflight.sh   : 元PNG⇔plck入力PNG のハッシュ一致、中国語講座の禁則
#   2. rm -rf dist && npx plck build : クリーンビルド（残骸累積を根絶）
#   3. dist/{unit_id} → 講座セットフォルダ/.../LMS搭載用ZIP/{name}.zip
#      macOSメタ・.gitkeep を除外
#   4. verify_zip.sh  : 24本すべてを構造・参照整合性検証
#
# 使い方:
#   ./tools/scripts/build_all.sh
#   ./tools/scripts/build_all.sh --skip-preflight  # 緊急用（非推奨）
# =============================================================================
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE="$(cd "$SCRIPT_DIR/../.." && pwd)"
PLCK="$BASE/plck-main"
SET="$BASE/講座セットフォルダ"
DIST="$PLCK/dist"

SKIP_PREFLIGHT=0
for arg in "$@"; do
  case "$arg" in
    --skip-preflight) SKIP_PREFLIGHT=1 ;;
    -h|--help)
      sed -n '1,25p' "$0"; exit 0 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

PAIRS=(
  "vi-logistics01|ベトナム語_よくわかる！ロジスティクス入門Ⅰ"
  "vi-logistics02|ベトナム語_よくわかる！ロジスティクス入門Ⅱ"
  "vi-logistics03|ベトナム語_よくわかる！ロジスティクス入門Ⅲ"
  "vi-logistics04|ベトナム語_よくわかる！ロジスティクス入門Ⅳ"
  "zh-logistics01|中国語_よくわかる！ロジスティクス入門Ⅰ"
  "zh-logistics02|中国語_よくわかる！ロジスティクス入門Ⅱ"
  "zh-logistics03|中国語_よくわかる！ロジスティクス入門Ⅲ"
  "zh-logistics04|中国語_よくわかる！ロジスティクス入門Ⅳ"
)

log() { printf '\n\033[1;34m=== %s ===\033[0m\n' "$*"; }

############################################
# STEP 1: preflight
############################################
if (( SKIP_PREFLIGHT == 0 )); then
  log "STEP 1/4 : preflight — 元PNGと plck入力PNGのハッシュ照合・中国語禁則"
  bash "$SCRIPT_DIR/preflight.sh"
else
  echo "[build_all] WARNING: --skip-preflight 指定。事前チェックを飛ばします（非推奨）"
fi

############################################
# STEP 2: clean build
############################################
log "STEP 2/4 : clean build — rm -rf dist && npx plck build"
cd "$PLCK"
rm -rf dist
npx plck build 2>&1 | tail -3

############################################
# STEP 3: ZIP 生成（全24本）
############################################
log "STEP 3/4 : ZIP 生成 (24本) → 各講座の LMS搭載用ZIP/ に配置"
ZIP_LIST=()
for pair in "${PAIRS[@]}"; do
  prefix="${pair%%|*}"
  course="${pair##*|}"
  lms_dir="$SET/$course/LMS搭載用ZIP"
  mkdir -p "$lms_dir"
  for u in unit01 unit02 unit03; do
    unit_id="${prefix}-${u}"
    zip_name="${prefix//-/_}_${u}.zip"
    src="$DIST/$unit_id"
    dst="$lms_dir/$zip_name"
    if [[ ! -d "$src" ]]; then
      echo "[build_all][ERROR] dist 生成物が無い: $src" >&2
      exit 3
    fi
    rm -f "$dst"
    (cd "$src" && zip -rqX "$dst" . -x ".gitkeep" "img/.gitkeep" "*.DS_Store" "__MACOSX/*")
    size=$(du -h "$dst" | awk '{print $1}')
    printf '  -> %s  (%s)\n' "$zip_name" "$size"
    ZIP_LIST+=("$dst")
  done
done

############################################
# STEP 4: verify_zip
############################################
log "STEP 4/4 : verify_zip — 全ZIPの構造と参照整合性を検証"
bash "$SCRIPT_DIR/verify_zip.sh" "${ZIP_LIST[@]}"

log "ALL DONE — ${#ZIP_LIST[@]} 本のZIPを生成・検証しました"
printf '\n配置先: %s/<講座名>/LMS搭載用ZIP/\n' "$SET"
