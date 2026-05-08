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
#      対象: vi/zh-logistics (24本) + privacy/security (8本) = 計 32 本
#      macOSメタ・.gitkeep を除外
#   4. verify_zip.sh  : 32本すべてを構造・参照整合性検証
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

# privacy / security 日本語講座: unit_id | 配置先講座フォルダ相対パス
# ZIP名は unit_id のハイフンをアンダースコアに変換した形（例: privacy_unit1.zip）。
JP_UNITS=(
  "privacy-unit1|個人情報保護/個人情報の取扱"
  "privacy-unit2|個人情報保護/個人情報の取扱"
  "privacy-unit3|個人情報保護/個人情報の取扱"
  "privacy-unit4|個人情報保護/個人情報の取扱"
  "security-unit1|個人情報保護/情報セキュリティ"
  "security-unit2|個人情報保護/情報セキュリティ"
  "security-unit3|個人情報保護/情報セキュリティ"
  "security-unit4|個人情報保護/情報セキュリティ"
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
# STEP 3: ZIP 生成（vi/zh × 3 = 24本 + privacy/security × 4 = 8本 = 計32本）
############################################
JP_COUNT=${#JP_UNITS[@]}
TOTAL=$(( ${#PAIRS[@]} * 3 + JP_COUNT ))
log "STEP 3/4 : ZIP 生成 (${TOTAL}本) → 各講座の LMS搭載用ZIP/ に配置"
ZIP_LIST=()

zip_one() {
  local unit_id="$1" lms_dir="$2" zip_name="$3"
  local src="$DIST/$unit_id"
  local dst="$lms_dir/$zip_name"
  mkdir -p "$lms_dir"
  if [[ ! -d "$src" ]]; then
    echo "[build_all][ERROR] dist 生成物が無い: $src" >&2
    exit 3
  fi
  rm -f "$dst"
  (cd "$src" && zip -rqX "$dst" . -x ".gitkeep" "img/.gitkeep" "*.DS_Store" "__MACOSX/*")
  local size
  size=$(du -h "$dst" | awk '{print $1}')
  printf '  -> %s  (%s)\n' "$zip_name" "$size"
  ZIP_LIST+=("$dst")
}

# vi/zh ロジスティクス（prefix × unit01..03）
for pair in "${PAIRS[@]}"; do
  prefix="${pair%%|*}"
  course="${pair##*|}"
  lms_dir="$SET/$course/LMS搭載用ZIP"
  for u in unit01 unit02 unit03; do
    unit_id="${prefix}-${u}"
    zip_name="${prefix//-/_}_${u}.zip"
    zip_one "$unit_id" "$lms_dir" "$zip_name"
  done
done

# privacy / security 日本語講座（unit1..4）
for entry in "${JP_UNITS[@]}"; do
  unit_id="${entry%%|*}"
  course_rel="${entry##*|}"
  lms_dir="$SET/$course_rel/LMS搭載用ZIP"
  zip_name="${unit_id//-/_}.zip"   # privacy-unit1 -> privacy_unit1.zip
  zip_one "$unit_id" "$lms_dir" "$zip_name"
done

############################################
# STEP 4: verify_zip
############################################
log "STEP 4/4 : verify_zip — 全ZIPの構造と参照整合性を検証"
bash "$SCRIPT_DIR/verify_zip.sh" "${ZIP_LIST[@]}"

log "ALL DONE — ${#ZIP_LIST[@]} 本のZIPを生成・検証しました"
printf '\n配置先: %s/<講座名>/LMS搭載用ZIP/\n' "$SET"
