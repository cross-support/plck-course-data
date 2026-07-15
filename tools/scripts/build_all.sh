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
#      対象: vi/zh-logistics (24本) + privacy/security (8本) + harass-sexual/power (8本)
#          + biz-doc (4本) + report-minutes (4本) + call-claim/phone (8本)
#          + workskill01/02/03 (24本) = 計 80 本
#      macOSメタ・.gitkeep を除外。iCloud競合(assets 2等)を掃除＋ガードし、
#      各本を一時領域でzip→verify_zip通過後にのみ本番配置（壊れZIPで旧版を上書きしない）
#   4. verify_zip.sh  : 80本すべてを構造・参照整合性で最終検証（配置前検証の念押し）
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

# iCloud 同期競合（"○○ 2" 複製 / "assets 2" 分裂）の掃除＆ガード関数を読み込む
source "$SCRIPT_DIR/icloud_guard.sh"

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
  "privacy-unit1|コンプラ/個人情報の取扱"
  "privacy-unit2|コンプラ/個人情報の取扱"
  "privacy-unit3|コンプラ/個人情報の取扱"
  "privacy-unit4|コンプラ/個人情報の取扱"
  "security-unit1|コンプラ/情報セキュリティ"
  "security-unit2|コンプラ/情報セキュリティ"
  "security-unit3|コンプラ/情報セキュリティ"
  "security-unit4|コンプラ/情報セキュリティ"
  "harass-sexual-unit1|ハラスメント防止/セクシャルハラスメント防止の基本"
  "harass-sexual-unit2|ハラスメント防止/セクシャルハラスメント防止の基本"
  "harass-sexual-unit3|ハラスメント防止/セクシャルハラスメント防止の基本"
  "harass-sexual-unit4|ハラスメント防止/セクシャルハラスメント防止の基本"
  "harass-power-unit1|ハラスメント防止/パワーハラスメント防止の基本"
  "harass-power-unit2|ハラスメント防止/パワーハラスメント防止の基本"
  "harass-power-unit3|ハラスメント防止/パワーハラスメント防止の基本"
  "harass-power-unit4|ハラスメント防止/パワーハラスメント防止の基本"
  "biz-doc-unit1|ライティング・文書作成/ビジネス文書の基本"
  "biz-doc-unit2|ライティング・文書作成/ビジネス文書の基本"
  "biz-doc-unit3|ライティング・文書作成/ビジネス文書の基本"
  "biz-doc-unit4|ライティング・文書作成/ビジネス文書の基本"
  "report-minutes-unit1|ライティング・文書作成/報告書・議事録の作成術"
  "report-minutes-unit2|ライティング・文書作成/報告書・議事録の作成術"
  "report-minutes-unit3|ライティング・文書作成/報告書・議事録の作成術"
  "report-minutes-unit4|ライティング・文書作成/報告書・議事録の作成術"
  "call-claim-unit1|コールセンター専門/クレーム対応の実践"
  "call-claim-unit2|コールセンター専門/クレーム対応の実践"
  "call-claim-unit3|コールセンター専門/クレーム対応の実践"
  "call-claim-unit4|コールセンター専門/クレーム対応の実践"
  "call-phone-unit1|コールセンター専門/電話応対の基本マナー"
  "call-phone-unit2|コールセンター専門/電話応対の基本マナー"
  "call-phone-unit3|コールセンター専門/電話応対の基本マナー"
  "call-phone-unit4|コールセンター専門/電話応対の基本マナー"
  "workskill01-unit1|ワークスキル/ワークスキル実践講座Ⅰ（基礎編）"
  "workskill01-unit2|ワークスキル/ワークスキル実践講座Ⅰ（基礎編）"
  "workskill01-unit3|ワークスキル/ワークスキル実践講座Ⅰ（基礎編）"
  "workskill01-unit4|ワークスキル/ワークスキル実践講座Ⅰ（基礎編）"
  "workskill01-unit5|ワークスキル/ワークスキル実践講座Ⅰ（基礎編）"
  "workskill01-unit6|ワークスキル/ワークスキル実践講座Ⅰ（基礎編）"
  "workskill01-unit7|ワークスキル/ワークスキル実践講座Ⅰ（基礎編）"
  "workskill01-unit8|ワークスキル/ワークスキル実践講座Ⅰ（基礎編）"
  "workskill02-unit1|ワークスキル/ワークスキル実践講座Ⅱ（実践編）"
  "workskill02-unit2|ワークスキル/ワークスキル実践講座Ⅱ（実践編）"
  "workskill02-unit3|ワークスキル/ワークスキル実践講座Ⅱ（実践編）"
  "workskill02-unit4|ワークスキル/ワークスキル実践講座Ⅱ（実践編）"
  "workskill02-unit5|ワークスキル/ワークスキル実践講座Ⅱ（実践編）"
  "workskill02-unit6|ワークスキル/ワークスキル実践講座Ⅱ（実践編）"
  "workskill02-unit7|ワークスキル/ワークスキル実践講座Ⅱ（実践編）"
  "workskill02-unit8|ワークスキル/ワークスキル実践講座Ⅱ（実践編）"
  "workskill03-unit1|ワークスキル/ワークスキル実践講座Ⅲ（自律編）"
  "workskill03-unit2|ワークスキル/ワークスキル実践講座Ⅲ（自律編）"
  "workskill03-unit3|ワークスキル/ワークスキル実践講座Ⅲ（自律編）"
  "workskill03-unit4|ワークスキル/ワークスキル実践講座Ⅲ（自律編）"
  "workskill03-unit5|ワークスキル/ワークスキル実践講座Ⅲ（自律編）"
  "workskill03-unit6|ワークスキル/ワークスキル実践講座Ⅲ（自律編）"
  "workskill03-unit7|ワークスキル/ワークスキル実践講座Ⅲ（自律編）"
  "workskill03-unit8|ワークスキル/ワークスキル実践講座Ⅲ（自律編）"
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

# ビルド直後、iCloud が生成した空の同期競合（"○○ 2" / "assets 2"）を掃除する。
# 非空の実分裂は各 ZIP 化直前（zip_one）でガード＋verify_zip し、通過時のみ本番配置する
# （STEP4 は全80本の最終念押し検証）。
plck_clean_icloud_conflicts "$DIST"

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
  # ZIP化直前ガード: 空の iCloud 競合を掃除し、非空の実分裂が残れば中止（404防止）
  plck_clean_icloud_conflicts "$src"
  plck_assert_no_icloud_conflicts "$src" || exit 4
  # 一時（非iCloud=$TMPDIR）で ZIP を組み、verify_zip 通過後にのみ本番配置する。
  # 壊れたZIPで旧・正常ZIPを上書きしないための配置前ゲート（CLAUDE.md 禁則8）。
  # 一時ディレクトリ方式にして中間ファイルのリークを防ぐ（ループ80回でも残さない）。
  local tmp_dir tmp_zip vz_out
  tmp_dir="$(mktemp -d -t plck_zip_XXXX)"
  tmp_zip="$tmp_dir/out.zip"
  (cd "$src" && zip -rqX "$tmp_zip" . -x ".gitkeep" "img/.gitkeep" "*.DS_Store" "__MACOSX/*")
  if ! vz_out="$(bash "$SCRIPT_DIR/verify_zip.sh" "$tmp_zip" 2>&1)"; then
    printf '%s\n' "$vz_out" >&2
    rm -rf "$tmp_dir"
    echo "[build_all][ERROR] verify_zip 失敗のため本番配置しません: $unit_id" >&2
    exit 5
  fi
  rm -f "$dst"
  mv "$tmp_zip" "$dst"
  rm -rf "$tmp_dir"
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
