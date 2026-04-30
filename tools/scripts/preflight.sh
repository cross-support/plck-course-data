#!/usr/bin/env bash
# =============================================================================
# preflight.sh
#   ビルド前チェック。失敗時は非ゼロ終了してビルドを止める。
#
# 検査項目:
#   1. 元PNG（講座セットフォルダ） と plck-main入力PNG の SHA-256 完全一致
#   2. 中国語(zh-*)講座での Meiryo→Arial 置換の禁則違反検出
#      - zh-* ユニットの slide/ に pptx が紛れ込んでいないか
#      - 元PNG と plck入力PNG の寸法・ハッシュ差があれば再レンダリングが疑われる
#   3. plck-main/contents/scenes/slide/{unit}/slide/ に期待枚数の {N}.png が揃っているか
#
# 使い方:
#   ./tools/scripts/preflight.sh            # 全講座を検査
#   ./tools/scripts/preflight.sh zh-logistics01-unit01  # 単一UNITのみ
# =============================================================================
set -u
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE="$(cd "$SCRIPT_DIR/../.." && pwd)"
SET="$BASE/講座セットフォルダ"
PLCK="$BASE/plck-main"

# 対象マッピング: unit_id_prefix | 講座フォルダ名
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

FILTER="${1:-}"
ERRORS=0
WARNINGS=0

log()  { printf '[preflight] %s\n' "$*"; }
err()  { printf '[preflight][ERROR] %s\n' "$*" >&2; ERRORS=$((ERRORS+1)); }
warn() { printf '[preflight][WARN]  %s\n' "$*" >&2; WARNINGS=$((WARNINGS+1)); }

check_unit() {
  local unit_id="$1" course_dir="$2" unit_no="$3"
  local src_dir="$SET/$course_dir/UNIT${unit_no}"
  local plck_dir="$PLCK/contents/scenes/slide/$unit_id/slide"
  local is_chinese=0
  [[ "$unit_id" == zh-* ]] && is_chinese=1

  if [[ ! -d "$src_dir" ]]; then
    err "$unit_id: 元素材フォルダが無い: $src_dir"; return
  fi
  if [[ ! -d "$plck_dir" ]]; then
    err "$unit_id: plck-main 入力フォルダが無い: $plck_dir"; return
  fi

  # (2) 中国語講座での pptx 混入禁則
  if (( is_chinese )); then
    local pptx_cnt
    pptx_cnt=$(find "$plck_dir" -maxdepth 1 \( -name '*.pptx' -o -name '*.pdf' \) 2>/dev/null | wc -l | tr -d ' ')
    if (( pptx_cnt > 0 )); then
      err "$unit_id: 中国語ユニットに pptx/pdf が混入 ($pptx_cnt 件)。Meiryo→Arial置換の入口。禁止（LMS_BUILD_RULES.md §1, §4）"
    fi
  fi

  # (3) 枚数チェック
  # macOS APFS は NFD 分解でファイル名を保持するため `-name 'スライド*.png'` は
  # 完全マッチしない。全PNGを拾ってから basename 側で判定する。
  local src_files
  src_files=$(find "$src_dir" -maxdepth 1 -type f -name '*.png' 2>/dev/null | sort)
  local src_cnt plck_cnt
  src_cnt=$(printf '%s\n' "$src_files" | grep -c . || true)
  plck_cnt=$(find "$plck_dir" -maxdepth 1 -type f -name '*.png' 2>/dev/null | wc -l | tr -d ' ')
  if (( src_cnt == 0 )); then
    err "$unit_id: 元PNGが0枚。講座セットフォルダに素材が無い"
    return
  fi
  if (( src_cnt != plck_cnt )); then
    err "$unit_id: 枚数不一致 src=$src_cnt plck=$plck_cnt (LMS_BUILD_RULES.md §1-1, §6)"
  fi

  # (1) ハッシュ完全一致チェック
  local mismatch=0 missing=0
  local i src_file plck_file src_sha plck_sha
  while IFS= read -r src_file; do
    [[ -n "$src_file" && -e "$src_file" ]] || continue
    # basename から「...N.png」の末尾数字を抽出（ファイル名先頭の日本語部分に依存しない）
    i=$(basename "$src_file" .png | sed -E 's/.*[^0-9]([0-9]+)$/\1/')
    if [[ -z "$i" ]]; then
      warn "$unit_id: ファイル名から番号が取れない: $(basename "$src_file")"
      continue
    fi
    plck_file="$plck_dir/${i}.png"
    if [[ ! -f "$plck_file" ]]; then
      missing=$((missing+1))
      err "$unit_id: plck入力PNG欠損 ${i}.png"
      continue
    fi
    src_sha=$(shasum -a 256 "$src_file" | awk '{print $1}')
    plck_sha=$(shasum -a 256 "$plck_file" | awk '{print $1}')
    if [[ "$src_sha" != "$plck_sha" ]]; then
      mismatch=$((mismatch+1))
      local msg="$unit_id: PNG SHA-256 不一致 slide=$i src=${src_sha:0:12} plck=${plck_sha:0:12}"
      if (( is_chinese )); then
        err "$msg （中国語: Meiryo→Arial置換の副作用が疑われます。元PNGで上書きし直してください）"
      else
        err "$msg"
      fi
    fi
  done <<< "$src_files"
  if (( mismatch == 0 && missing == 0 )); then
    log "OK  $unit_id  ($src_cnt PNG, hash all match)"
  fi
}

log "BASE=$BASE"
log "checking ${#PAIRS[@]} course × 3 UNIT = 24 units"
if [[ -n "$FILTER" ]]; then
  log "filter=$FILTER"
fi
echo

for pair in "${PAIRS[@]}"; do
  prefix="${pair%%|*}"
  course="${pair##*|}"
  for u in 1 2 3; do
    unit_id="${prefix}-unit0${u}"
    if [[ -n "$FILTER" && "$unit_id" != "$FILTER" ]]; then continue; fi
    check_unit "$unit_id" "$course" "$u"
  done
done

echo
log "SUMMARY: errors=$ERRORS warnings=$WARNINGS"
if (( ERRORS > 0 )); then
  err "preflight FAILED — ビルドを中止してください"
  exit 1
fi
log "preflight OK"
exit 0
