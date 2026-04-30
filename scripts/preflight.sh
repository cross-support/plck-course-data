#!/usr/bin/env bash
# =============================================================================
# scripts/preflight.sh — リポジトリ層 preflight ラッパー
#
# tools/scripts/preflight.sh が「素材の SHA-256 一致」など制作層を担当するのに対し、
# 本スクリプトは「リポジトリ構造の健全性」を確認する。最後に tools 側 preflight
# を呼び出して 1 コマンドで全部通るようにする。
#
# 検査項目:
#   - 必須ドキュメント/スクリプトが揃っている
#   - .env が誤って commit 対象になっていない
#   - 大きすぎるファイル（>50MB）が staging にいない
#   - tools/scripts/preflight.sh を実行して制作層の健全性を確認
#
# 使い方:
#   bash scripts/preflight.sh                       # 全検査
#   bash scripts/preflight.sh zh-logistics01-unit01 # 制作層は単一UNIT のみ
#   bash scripts/preflight.sh --skip-tools          # 制作層 preflight をスキップ
# =============================================================================

set -u
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE="$(cd "$SCRIPT_DIR/.." && pwd)"

ERRORS=0
WARNINGS=0
SKIP_TOOLS=0
UNIT_FILTER=""

for arg in "$@"; do
  case "$arg" in
    --skip-tools) SKIP_TOOLS=1 ;;
    -h|--help)
      sed -n '1,25p' "$0"; exit 0 ;;
    *) UNIT_FILTER="$arg" ;;
  esac
done

c_red()  { printf '\033[31m%s\033[0m' "$*"; }
c_grn()  { printf '\033[32m%s\033[0m' "$*"; }
c_yel()  { printf '\033[33m%s\033[0m' "$*"; }
c_cyan() { printf '\033[36m%s\033[0m' "$*"; }

ok()   { printf '[preflight-repo] %s %s\n' "$(c_grn '✓')" "$*"; }
warn() { printf '[preflight-repo] %s %s\n' "$(c_yel '⚠')" "$*" >&2; WARNINGS=$((WARNINGS+1)); }
err()  { printf '[preflight-repo] %s %s\n' "$(c_red '✗')" "$*" >&2; ERRORS=$((ERRORS+1)); }
sect() { printf '\n%s\n' "$(c_cyan "=== $* ===")"; }

cd "$BASE"

# -----------------------------------------------------------------------------
# 1. 必須ドキュメント
# -----------------------------------------------------------------------------
sect "1. 必須ドキュメントの存在"

REQ_DOCS=(
  "README.md"
  "CLAUDE.md"
  "LMS_BUILD_RULES.md"
  "RULES.md"
  "SETUP.md"
  "SKILLS.md"
  "CHANGELOG.md"
  "docs/folder-structure.md"
  "docs/build-flow.md"
  "docs/lms-zip-flow.md"
  "docs/translation-rules.md"
  "docs/tag-rules.md"
  "docs/troubleshooting.md"
)

for f in "${REQ_DOCS[@]}"; do
  if [[ -f "$f" ]]; then
    ok "$f"
  else
    err "$f が無い"
  fi
done

# -----------------------------------------------------------------------------
# 2. 重要フォルダの存在
# -----------------------------------------------------------------------------
sect "2. 重要フォルダの存在"

for d in "tools" "tools/scripts" "scripts" "docs" "plck-main"; do
  if [[ -d "$d" ]]; then
    ok "$d/"
  else
    err "$d/ が無い"
  fi
done

# -----------------------------------------------------------------------------
# 3. .env が commit 対象に入っていないか
# -----------------------------------------------------------------------------
sect "3. .env が tracked になっていないか"

if [[ -d ".git" ]]; then
  if git ls-files --error-unmatch .env >/dev/null 2>&1; then
    err ".env が tracked です。git rm --cached .env で除外してください"
  else
    ok ".env は tracked ではない"
  fi

  # .env.local や .env.production も同様に
  for envf in ".env.local" ".env.production" ".env.development"; do
    if git ls-files --error-unmatch "$envf" >/dev/null 2>&1; then
      err "$envf が tracked です。除外してください"
    fi
  done
else
  warn ".git が無いためスキップ（git init 前）"
fi

# -----------------------------------------------------------------------------
# 4. 大きすぎる tracked ファイル
# -----------------------------------------------------------------------------
sect "4. 大きすぎる tracked ファイル（>50MB）"

if [[ -d ".git" ]]; then
  LARGE=$(git ls-files | while read -r f; do
    [[ -f "$f" ]] || continue
    SIZE=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null || echo 0)
    if (( SIZE > 50 * 1024 * 1024 )); then
      printf '%s\t%s MB\n' "$f" "$((SIZE / 1024 / 1024))"
    fi
  done)
  if [[ -z "$LARGE" ]]; then
    ok "50MB 超の tracked ファイルなし"
  else
    err "50MB 超の tracked ファイルあり:"
    echo "$LARGE" | sed 's/^/    /'
  fi
else
  warn ".git が無いためスキップ"
fi

# -----------------------------------------------------------------------------
# 5. node_modules / dist が誤って tracked になっていないか
# -----------------------------------------------------------------------------
sect "5. node_modules / dist が tracked になっていないか"

if [[ -d ".git" ]]; then
  if git ls-files | grep -qE "(^|/)node_modules/"; then
    err "node_modules/ が tracked です"
  else
    ok "node_modules/ は tracked ではない"
  fi

  if git ls-files | grep -qE "^plck-main/dist/"; then
    err "plck-main/dist/ が tracked です"
  else
    ok "plck-main/dist/ は tracked ではない"
  fi

  if git ls-files | grep -qE "^講座セットフォルダ/"; then
    warn "講座セットフォルダ/ が一部 tracked です（運用方針確認）"
  else
    ok "講座セットフォルダ/ は tracked ではない（方針 A）"
  fi
else
  warn ".git が無いためスキップ"
fi

# -----------------------------------------------------------------------------
# 6. 統計（参考）
# -----------------------------------------------------------------------------
sect "6. 統計（参考）"

# PNG / ZIP の枚数
if [[ -d "$BASE/講座セットフォルダ" ]]; then
  PNG_CNT=$(find "$BASE/講座セットフォルダ" -type f -name '*.png' 2>/dev/null | wc -l | tr -d ' ')
  ZIP_CNT=$(find "$BASE/講座セットフォルダ" -type f -name '*.zip' 2>/dev/null | wc -l | tr -d ' ')
  printf '[preflight-repo] 講座セットフォルダ PNG=%s ZIP=%s\n' "$PNG_CNT" "$ZIP_CNT"
else
  warn "講座セットフォルダ/ が未配置（素材取得前）"
fi

# -----------------------------------------------------------------------------
# 7. 制作層 preflight を呼び出し（tools/scripts/preflight.sh）
# -----------------------------------------------------------------------------
if (( SKIP_TOOLS == 0 )); then
  sect "7. 制作層 preflight（tools/scripts/preflight.sh）"
  if [[ -x "$BASE/tools/scripts/preflight.sh" ]]; then
    if [[ -d "$BASE/講座セットフォルダ" ]]; then
      if ! bash "$BASE/tools/scripts/preflight.sh" "$UNIT_FILTER"; then
        err "制作層 preflight が FAIL"
      else
        ok "制作層 preflight PASS"
      fi
    else
      warn "講座セットフォルダ/ が無いため制作層 preflight をスキップ"
    fi
  else
    err "tools/scripts/preflight.sh が無いか実行不可"
  fi
else
  sect "7. 制作層 preflight（--skip-tools 指定でスキップ）"
fi

# -----------------------------------------------------------------------------
# 結果
# -----------------------------------------------------------------------------
sect "結果"
printf '[preflight-repo] errors=%s warnings=%s\n' "$ERRORS" "$WARNINGS"

if (( ERRORS > 0 )); then
  err "preflight FAILED"
  exit 1
fi

if (( WARNINGS > 0 )); then
  warn "warnings あり（continue 可能）"
fi

ok "preflight PASS"
exit 0
