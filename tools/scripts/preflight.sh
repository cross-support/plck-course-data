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

# 対象マッピング (vi/zh ロジスティクス): unit_id_prefix | 講座フォルダ名
# 各 prefix は unit01〜unit03 の 3 ユニットを持つ。
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

# 対象マッピング (privacy / security 日本語講座): unit_id | scene名 | 元素材ユニットフォルダ相対パス
# vi/zh と異なり「UNIT{N}」形式ではなく、ユニットごとに固有のフォルダ名・scene名を持つため
# 4 要素タプルで明示。zh-* 禁則チェックは適用外。
JP_UNITS=(
  "privacy-unit1|privacy-basics|個人情報保護/個人情報の取扱/Unit 1 個人情報保護の基礎知識"
  "privacy-unit2|privacy-rules|個人情報保護/個人情報の取扱/Unit 2 個人情報の取得・利用・提供のルール"
  "privacy-unit3|privacy-safety|個人情報保護/個人情報の取扱/Unit 3 安全管理措置と漏洩対応"
  "privacy-unit4|privacy-practice|個人情報保護/個人情報の取扱/Unit 4 日常業務での実践"
  "security-unit1|security-basics|個人情報保護/情報セキュリティ/Unit 1 情報セキュリティの基礎"
  "security-unit2|security-attacks|個人情報保護/情報セキュリティ/Unit 2 サイバー攻撃の⼿⼝と対策"
  "security-unit3|security-password|個人情報保護/情報セキュリティ/Unit 3パスワードとデバイス管理"
  "security-unit4|security-daily|個人情報保護/情報セキュリティ/Unit4⽇常業務とインシデント対応"
  "harass-sexual-unit1|harass-sexual-def|ハラスメント防止/セクシャルハラスメント防止の基本/UNIT1セクハラの定義と種類"
  "harass-sexual-unit2|harass-sexual-cases|ハラスメント防止/セクシャルハラスメント防止の基本/UNIT2職場での具体的事例と判断基準"
  "harass-sexual-unit3|harass-sexual-sogi|ハラスメント防止/セクシャルハラスメント防止の基本/UNIT3 SOGIハラスメントの理解"
  "harass-sexual-unit4|harass-sexual-prevent|ハラスメント防止/セクシャルハラスメント防止の基本/UNIT4被害者・加害者にならないために"
  "harass-power-unit1|harass-power-def|ハラスメント防止/パワーハラスメント防止の基本/UNIT1 パワハラの定義と6類型"
  "harass-power-unit2|harass-power-gray|ハラスメント防止/パワーハラスメント防止の基本/UNIT2指導とパワハラの境界線（グレーゾーン）"
  "harass-power-unit3|harass-power-anger|ハラスメント防止/パワーハラスメント防止の基本/UNIT3アンガーマネジメントの基礎"
  "harass-power-unit4|harass-power-action|ハラスメント防止/パワーハラスメント防止の基本/UNIT4防止のための行動指針と職場の義務"
  "biz-doc-unit1|biz-doc-types|ビジネス文書の基本/Unit 1ビジネス文書の種類と目的"
  "biz-doc-unit2|biz-doc-prep|ビジネス文書の基本/UNIT2 正確・簡潔・分かりやすい文章術（PREP法）"
  "biz-doc-unit3|biz-doc-layout|ビジネス文書の基本/UNIT3 レイアウトと体裁の整え方"
  "biz-doc-unit4|biz-doc-internal-external|ビジネス文書の基本/UNIT4 社内文書・社外文書の違い"
  "report-minutes-unit1|report-minutes-structure|報告書・議事録の作成術/Unit 1 報告書の構造と書き方"
  "report-minutes-unit2|report-minutes-fact-opinion|報告書・議事録の作成術/Unit 2 事実と意見の明確な区別"
  "report-minutes-unit3|report-minutes-5w1h|報告書・議事録の作成術/Unit 3 議事録の取り方とまとめ方（5W1H）"
  "report-minutes-unit4|report-minutes-ai|報告書・議事録の作成術/Unit 4 AIを活用した議事録作成"
  "call-claim-unit1|call-claim-types|コールセンター専門/クレーム対応の実践/Unit1_クレームの種類と顧客心理"
  "call-claim-unit2|call-claim-initial|コールセンター専門/クレーム対応の実践/Unit2_初期対応の重要性（謝罪と傾聴）"
  "call-claim-unit3|call-claim-closing|コールセンター専門/クレーム対応の実践/Unit3_解決提案とクロージング"
  "call-claim-unit4|call-claim-escalation|コールセンター専門/クレーム対応の実践/Unit4_エスカレーション判断と自己のメンタルケア"
  "call-phone-unit1|call-phone-voice|コールセンター専門/電話応対の基本マナー/Unit 1 -第一印象を決める発声・滑舌"
  "call-phone-unit2|call-phone-listening|コールセンター専門/電話応対の基本マナー/Unit 2 -正確な聞き取りと復唱"
  "call-phone-unit3|call-phone-keigo|コールセンター専門/電話応対の基本マナー/Unit 3 -敬語と言葉遣い（クッション言葉）"
  "call-phone-unit4|call-phone-transfer|コールセンター専門/電話応対の基本マナー/Unit 4 -保留・転送のマナー"
)

FILTER="${1:-}"
ERRORS=0
WARNINGS=0

log()  { printf '[preflight] %s\n' "$*"; }
err()  { printf '[preflight][ERROR] %s\n' "$*" >&2; ERRORS=$((ERRORS+1)); }
warn() { printf '[preflight][WARN]  %s\n' "$*" >&2; WARNINGS=$((WARNINGS+1)); }

# vi/zh ロジスティクス用: src_dir = $SET/$course_dir/UNIT{N}, scene = unit_id
check_unit() {
  local unit_id="$1" course_dir="$2" unit_no="$3"
  local src_dir="$SET/$course_dir/UNIT${unit_no}"
  local plck_dir="$PLCK/contents/scenes/slide/$unit_id/slide"
  _check_pair "$unit_id" "$src_dir" "$plck_dir"
}

# privacy/security 日本語講座用: src_dir / scene を明示指定
check_unit_jp() {
  local unit_id="$1" scene_name="$2" src_rel="$3"
  local src_dir="$SET/$src_rel"
  local plck_dir="$PLCK/contents/scenes/slide/$scene_name/slide"
  _check_pair "$unit_id" "$src_dir" "$plck_dir"
}

# 共通本体: 元PNG ⇔ plck入力PNG の枚数・ハッシュ照合と中国語禁則チェック
_check_pair() {
  local unit_id="$1" src_dir="$2" plck_dir="$3"
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
log "checking ${#PAIRS[@]} course × 3 UNIT (vi/zh) + ${#JP_UNITS[@]} JP units (privacy/security)"
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

for entry in "${JP_UNITS[@]}"; do
  IFS='|' read -r unit_id scene_name src_rel <<< "$entry"
  if [[ -n "$FILTER" && "$unit_id" != "$FILTER" ]]; then continue; fi
  check_unit_jp "$unit_id" "$scene_name" "$src_rel"
done

echo
log "SUMMARY: errors=$ERRORS warnings=$WARNINGS"
if (( ERRORS > 0 )); then
  err "preflight FAILED — ビルドを中止してください"
  exit 1
fi
log "preflight OK"
exit 0
