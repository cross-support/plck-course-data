#!/usr/bin/env bash
# =============================================================================
# verify_zip.sh
#   LMS 搭載用 ZIP の構造と参照整合性を検査する。失敗時は非ゼロ終了。
#
# 検査項目:
#   1. ルート直下に index.html が存在する（1 階層深いラップは NG）
#   2. ルート直下に favicon.ico / assets/ が存在する
#   3. index.html が参照する assets/index-*.js と assets/index-*.css が
#      ZIP 内に実在する
#   4. assets/index-*.js / assets/index-*.css の累積重複が無い（各 1 個のみ）
#   5. macOS メタ（__MACOSX/ / .DS_Store / ._*）が混入していない
#   6. 空 placeholder (.gitkeep) が混入していない
#
# 使い方:
#   ./tools/scripts/verify_zip.sh path/to/zip1 [path/to/zip2 ...]
# =============================================================================
set -u
IFS=$'\n\t'

if (( $# == 0 )); then
  echo "Usage: $0 <zipfile> [zipfile2 ...]" >&2
  exit 2
fi

TOTAL_ERR=0

verify_one() {
  local zip="$1"
  local errs=0
  local base
  base=$(basename "$zip")

  if [[ ! -f "$zip" ]]; then
    printf '[verify_zip][ERROR] %s: ファイルが存在しない\n' "$base" >&2
    return 1
  fi

  local listing
  listing=$(unzip -l "$zip" 2>/dev/null) || {
    printf '[verify_zip][ERROR] %s: 破損ZIP\n' "$base" >&2
    return 1
  }

  local names
  # 列目の Name だけ抽出（ヘッダ2行とフッタ2行を除外）
  names=$(echo "$listing" | awk 'NR>3 && $1!="---------" && $2!="files" { $1=""; $2=""; $3=""; sub(/^   /, ""); if ($0 != "") print $0 }')

  # (1) index.html がルートに
  if ! echo "$names" | grep -qxE 'index\.html'; then
    printf '[verify_zip][ERROR] %s: ルート直下に index.html が無い（1階層深い可能性）\n' "$base" >&2
    errs=$((errs+1))
  fi
  # (2) favicon, assets/
  if ! echo "$names" | grep -qxE 'favicon\.ico'; then
    printf '[verify_zip][ERROR] %s: ルート直下に favicon.ico が無い\n' "$base" >&2
    errs=$((errs+1))
  fi
  if ! echo "$names" | grep -qxE 'assets/'; then
    printf '[verify_zip][ERROR] %s: assets/ ディレクトリエントリが無い\n' "$base" >&2
    errs=$((errs+1))
  fi

  # (3) index.html 内の参照ファイル実在
  local html ref_js ref_css
  html=$(unzip -p "$zip" index.html 2>/dev/null || true)
  ref_js=$(printf '%s' "$html" | grep -oE 'assets/index-[a-z0-9]+\.js' | head -1 || true)
  ref_css=$(printf '%s' "$html" | grep -oE 'assets/index-[a-z0-9]+\.css' | head -1 || true)
  if [[ -z "$ref_js" ]]; then
    printf '[verify_zip][ERROR] %s: index.html に JS 参照が見つからない\n' "$base" >&2
    errs=$((errs+1))
  else
    if ! echo "$names" | grep -qxF "$ref_js"; then
      printf '[verify_zip][ERROR] %s: 参照先 %s が ZIP 内に存在しない\n' "$base" "$ref_js" >&2
      errs=$((errs+1))
    fi
  fi
  if [[ -z "$ref_css" ]]; then
    printf '[verify_zip][ERROR] %s: index.html に CSS 参照が見つからない\n' "$base" >&2
    errs=$((errs+1))
  else
    if ! echo "$names" | grep -qxF "$ref_css"; then
      printf '[verify_zip][ERROR] %s: 参照先 %s が ZIP 内に存在しない\n' "$base" "$ref_css" >&2
      errs=$((errs+1))
    fi
  fi

  # (4) 累積重複チェック (各 1 個のみ)
  local js_cnt css_cnt
  js_cnt=$(echo "$names" | grep -cE '^assets/index-[a-z0-9]+\.js$' || true)
  css_cnt=$(echo "$names" | grep -cE '^assets/index-[a-z0-9]+\.css$' || true)
  if (( js_cnt != 1 )); then
    printf '[verify_zip][ERROR] %s: index-*.js 累積重複 count=%d (期待=1, dist残骸の同梱)\n' "$base" "$js_cnt" >&2
    errs=$((errs+1))
  fi
  if (( css_cnt != 1 )); then
    printf '[verify_zip][ERROR] %s: index-*.css 累積重複 count=%d (期待=1, dist残骸の同梱)\n' "$base" "$css_cnt" >&2
    errs=$((errs+1))
  fi

  # (5) macOS メタ混入
  if echo "$names" | grep -qE '^(__MACOSX|.*/\._|\._|.*\.DS_Store|\.DS_Store)'; then
    printf '[verify_zip][ERROR] %s: macOS メタファイルが混入\n' "$base" >&2
    errs=$((errs+1))
  fi

  # (6) .gitkeep
  if echo "$names" | grep -qE '(^|/)\.gitkeep$'; then
    printf '[verify_zip][WARN]  %s: .gitkeep が含まれている（搭載に支障はないが除外推奨）\n' "$base" >&2
  fi

  if (( errs == 0 )); then
    local size
    size=$(du -h "$zip" | awk '{print $1}')
    printf '[verify_zip] OK  %s  (%s)\n' "$base" "$size"
  else
    printf '[verify_zip] FAIL %s (errors=%d)\n' "$base" "$errs" >&2
  fi
  return "$errs"
}

for z in "$@"; do
  verify_one "$z" || TOTAL_ERR=$((TOTAL_ERR + $?))
done

if (( TOTAL_ERR > 0 )); then
  echo "[verify_zip] FAILED total_errors=$TOTAL_ERR" >&2
  exit 1
fi
echo "[verify_zip] ALL OK ($# zip)"
exit 0
