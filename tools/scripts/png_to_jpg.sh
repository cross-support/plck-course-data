#!/bin/bash
# =============================================================================
# png_to_jpg.sh
# 正本PNG（{N}.png）から配信用JPEG（{N}.jpg, quality=90）を併産する
#
# 対象: ファイル名が番号のみ（例: 1.png, 12.png）の PNG
# 対象外: "N 2.png" のような複製ファイル等、番号のみでないファイル
#   → 変換せず警告（skip）のみ。PNG 自体は削除しない。
#
# 依存: ImageMagick (magick コマンド)
#   brew install imagemagick
# =============================================================================
set -euo pipefail

usage() {
    cat <<EOF
usage: png_to_jpg.sh <slide_dir>

  slide_dir: {N}.png が並ぶスライドディレクトリ
             （例: plck-main/contents/scenes/slide/{unit_id}/slide）

例:
  png_to_jpg.sh /path/to/plck-main/contents/scenes/slide/privacy-basics/slide
  → 1.png, 2.png ... から 1.jpg, 2.jpg ... (quality=90) を生成
EOF
    exit 1
}

[ $# -eq 1 ] || usage
DIR="$1"

[ -d "$DIR" ] || { echo "ERROR: slide_dir not found: $DIR" >&2; exit 2; }
command -v magick > /dev/null || { echo "ERROR: magick not found (brew install imagemagick)" >&2; exit 1; }

converted=0
skipped=0

# 枚数減少時の孤児JPEG残留防止のため毎回クリア再生成
# （PNG側が build_unit.sh で毎回 rm -f *.png してから再配置するのと対称）
rm -f "$DIR"/*.jpg

for png in "$DIR"/*.png; do
    [ -f "$png" ] || continue
    base=$(basename "$png" .png)
    if [[ "$base" =~ ^[0-9]+$ ]]; then
        magick "$png" -quality 90 -strip "$DIR/$base.jpg"
        converted=$((converted+1))
    else
        echo "WARN: skip (not a plain number filename): $(basename "$png")" >&2
        skipped=$((skipped+1))
    fi
done

echo "OK: converted=$converted skipped=$skipped ($DIR)"
