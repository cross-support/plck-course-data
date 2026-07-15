#!/usr/bin/env bash
# =============================================================================
# build_unit.sh
# 単一 UNIT の完全自動ビルドフロー
#   pptx → 高画質PNG → PLCK ビルド → LMS 用 Zip
#
# 前提: plck.config.yaml, contents/scenes/slide/{unit}/config.*.yaml が存在し、
#       img 配列の枚数が pptx のスライド数と一致していること
# =============================================================================
set -eu

usage() {
    cat <<EOF
Usage: $0 <unit_id> <pptx_file> [lms_zip_output_dir]

  unit_id: plck-main のユニット名（例: zh-logistics01-unit01）
  pptx_file: 元 PowerPoint ファイル
  lms_zip_output_dir: LMS 用 Zip の出力先（省略時は plck-main 直下）

例:
  $0 zh-logistics01-unit01 /path/to/UNIT1.pptx /path/to/LMS搭載用ZIP
  → zh_logistics01_unit01.zip が出力先に配置される
EOF
    exit 1
}

[ $# -ge 2 ] || usage
UNIT_ID="$1"
PPTX="$2"
LMS_DIR="${3:-}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLCK="$(cd "$SCRIPT_DIR/../../plck-main" && pwd)"

# iCloud 同期競合（"○○ 2" 複製 / "assets 2" 分裂）の掃除＆ガード関数を読み込む
source "$SCRIPT_DIR/icloud_guard.sh"

# Zip 名: zh-logistics01-unit01 → zh_logistics01_unit01
ZIP_NAME=$(echo "$UNIT_ID" | sed 's/-/_/g').zip

# 1. PNG 生成 → plck-main の scenes/slide 配下に配置
SLIDE_DIR="$PLCK/contents/scenes/slide/$UNIT_ID/slide"
[ -d "$(dirname "$SLIDE_DIR")" ] || { echo "ERROR: unit not found in plck-main: $UNIT_ID" >&2; exit 2; }

TMP_PNG=$(mktemp -d -t build_unit_XXXX)
TMP_ZIP_DIR=""
trap 'rm -rf "$TMP_PNG"; [ -n "$TMP_ZIP_DIR" ] && rm -rf "$TMP_ZIP_DIR"' EXIT

echo ">>> [1/3] PNG generation"
bash "$SCRIPT_DIR/pptx_to_png.sh" "$PPTX" "$TMP_PNG"

# slide_001.png → 1.png (plck は無ゼロ連番を要求)
rm -f "$SLIDE_DIR"/*.png
mkdir -p "$SLIDE_DIR"
for f in "$TMP_PNG"/slide_*.png; do
    n=$(basename "$f" .png | sed 's/slide_0*//')
    num=$((10#$n))
    cp "$f" "$SLIDE_DIR/$num.png"
done
echo "    PNGs placed: $SLIDE_DIR"

# PNG配置後にJPEG(q90)併産＝配信用。正本はPNGのまま残す（このスクリプトはzh系で
# Meiryo→Arial置換を含むため既存zh移行の再実行には使わない。上記の禁則は変わらず有効）
bash "$SCRIPT_DIR/png_to_jpg.sh" "$SLIDE_DIR"

# 2. PLCK ビルド
echo ">>> [2/3] plck build"
(cd "$PLCK" && npx plck build > /dev/null 2>&1)

DIST_DIR="$PLCK/dist/$UNIT_ID"
[ -d "$DIST_DIR" ] || { echo "ERROR: build output not found: $DIST_DIR" >&2; exit 3; }

# 3. Zip 化
echo ">>> [3/3] Zip"
# Zip化直前ガード: 空の iCloud 競合を掃除し、非空の実分裂が残れば中止（404防止）
plck_clean_icloud_conflicts "$DIST_DIR"
plck_assert_no_icloud_conflicts "$DIST_DIR" || exit 4
# 一時ディレクトリ方式で中間ファイルのリークを防ぐ（trap で dir ごと掃除）
TMP_ZIP_DIR=$(mktemp -d -t plck_zip_XXXX)
TMP_ZIP="$TMP_ZIP_DIR/$ZIP_NAME"
(cd "$DIST_DIR" && zip -rqX "$TMP_ZIP" . -x ".gitkeep" "img/.gitkeep" "*.DS_Store" "__MACOSX/*")

# 生成物を検証（構造・参照整合・iCloud競合混入）。失敗なら set -e で中止し配置しない。
bash "$SCRIPT_DIR/verify_zip.sh" "$TMP_ZIP"

if [ -n "$LMS_DIR" ]; then
    mkdir -p "$LMS_DIR"
    cp -f "$TMP_ZIP" "$LMS_DIR/$ZIP_NAME"
    echo "OK: $LMS_DIR/$ZIP_NAME ($(du -h "$TMP_ZIP" | cut -f1))"
else
    cp -f "$TMP_ZIP" "$PLCK/$ZIP_NAME"
    echo "OK: $PLCK/$ZIP_NAME ($(du -h "$TMP_ZIP" | cut -f1))"
fi
rm -rf "$TMP_ZIP_DIR"
