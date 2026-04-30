#!/bin/bash
# =============================================================================
# pptx_to_png.sh
# PowerPoint ファイル (.pptx) から 高画質 PNG (2668×1500 @ 200 DPI) を生成する
#
# 主な機能:
#  - Meiryo フォントを Arial に置換（ベトナム語・中国語の文字化け対策）
#  - LibreOffice soffice で PDF 経由 → pdftoppm で高画質 PNG
#  - 出力は slide_001.png, slide_002.png ... の 3 桁連番
#
# 依存: LibreOffice, poppler (pdftoppm), zip, unzip
#   brew install --cask libreoffice
#   brew install poppler
# =============================================================================
set -eu

usage() {
    cat <<EOF
Usage: $0 <input.pptx> <output_dir>

  input.pptx: PowerPoint ファイルのパス
  output_dir: 生成する PNG の配置先ディレクトリ

例:
  $0 "/path/to/slides.pptx" "/path/to/out/UNIT1"
  → /path/to/out/UNIT1/slide_001.png 〜 slide_0NN.png
EOF
    exit 1
}

[ $# -eq 2 ] || usage
INPUT="$1"
OUT="$2"

[ -f "$INPUT" ] || { echo "ERROR: input not found: $INPUT" >&2; exit 2; }

SOFFICE="${SOFFICE_BIN:-/Applications/LibreOffice.app/Contents/MacOS/soffice}"
[ -x "$SOFFICE" ] || { echo "ERROR: soffice not found at $SOFFICE" >&2; exit 3; }
command -v pdftoppm > /dev/null || { echo "ERROR: pdftoppm not found (brew install poppler)" >&2; exit 3; }

TMP=$(mktemp -d -t pptx_to_png_XXXX)
trap "rm -rf '$TMP'" EXIT

mkdir -p "$OUT"

# 1. pptx をコピーして展開
cp "$INPUT" "$TMP/src.pptx"
mkdir "$TMP/unpacked"
(cd "$TMP/unpacked" && unzip -q ../src.pptx)
# zip 内のファイルが 000 パーミッションで格納されている場合があるので修復
chmod -R u+rw "$TMP/unpacked"

# 2. Meiryo → Arial 置換（VN 声調記号・中国語文字化け対策）
find "$TMP/unpacked" -name "*.xml" -exec sed -i '' 's/typeface="Meiryo"/typeface="Arial"/g' {} \;

# 3. 再圧縮
(cd "$TMP/unpacked" && zip -rq ../modified.pptx .)

# 4. LibreOffice 多重起動の衝突を避けるためシリアライズ
while pgrep -f "soffice.*--headless" > /dev/null; do sleep 1; done

# 5. soffice で PDF 変換
"$SOFFICE" --headless --convert-to pdf --outdir "$TMP" "$TMP/modified.pptx" > /dev/null 2>&1
PDF="$TMP/modified.pdf"
[ -f "$PDF" ] || { echo "ERROR: PDF conversion failed" >&2; exit 4; }

# 6. pdftoppm で 200 DPI PNG（2668×1500 相当）
pdftoppm -r 200 -png "$PDF" "$TMP/slide"

# 7. slide-NN.png → slide_NNN.png にリネームして出力
for f in "$TMP"/slide-*.png; do
    [ -f "$f" ] || continue
    n=$(basename "$f" .png | sed 's/slide-//')
    num=$((10#$n))
    new=$(printf "slide_%03d.png" "$num")
    cp "$f" "$OUT/$new"
done

count=$(ls "$OUT"/slide_*.png 2>/dev/null | wc -l | tr -d ' ')
w=$(identify -format "%w" "$OUT/slide_001.png" 2>/dev/null || echo "?")
h=$(identify -format "%h" "$OUT/slide_001.png" 2>/dev/null || echo "?")
echo "OK: $count PNGs (${w}x${h}) → $OUT"
