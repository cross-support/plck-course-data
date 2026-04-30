#!/usr/bin/env bash
# =============================================================================
# scripts/setup.sh — 初回セットアップスクリプト
#
# clone 直後に 1 回実行すれば、必要なディレクトリ作成・実行権限付与・
# 必須ファイル確認・必要コマンドの存在確認まで自動化する。
#
# 使い方:
#   bash scripts/setup.sh
#
# 終了コード:
#   0 — 成功
#   1 — 致命的エラー（必須ファイル不足など）
#   2 — 警告あり（推奨コマンドが無いなど。続行は可能）
# =============================================================================

set -u
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE="$(cd "$SCRIPT_DIR/.." && pwd)"

ERRORS=0
WARNINGS=0

c_red()   { printf '\033[31m%s\033[0m' "$*"; }
c_grn()   { printf '\033[32m%s\033[0m' "$*"; }
c_yel()   { printf '\033[33m%s\033[0m' "$*"; }
c_cyan()  { printf '\033[36m%s\033[0m' "$*"; }

log()  { printf '[setup] %s\n' "$*"; }
ok()   { printf '[setup] %s %s\n' "$(c_grn '✓')" "$*"; }
warn() { printf '[setup] %s %s\n' "$(c_yel '⚠')" "$*" >&2; WARNINGS=$((WARNINGS+1)); }
err()  { printf '[setup] %s %s\n' "$(c_red '✗')" "$*" >&2; ERRORS=$((ERRORS+1)); }
sect() { printf '\n%s\n' "$(c_cyan "=== $* ===")"; }

# -----------------------------------------------------------------------------
# 0. 現在地の確認
# -----------------------------------------------------------------------------
sect "0. 現在地"
log "BASE: $BASE"
cd "$BASE"

# -----------------------------------------------------------------------------
# 1. 必須ファイルの存在確認
# -----------------------------------------------------------------------------
sect "1. 必須ファイルの存在確認"

REQUIRED_FILES=(
  "README.md"
  "CLAUDE.md"
  "LMS_BUILD_RULES.md"
  "SETUP.md"
  "RULES.md"
  ".gitignore"
  "tools/scripts/preflight.sh"
  "tools/scripts/build_all.sh"
  "tools/scripts/verify_zip.sh"
)

for f in "${REQUIRED_FILES[@]}"; do
  if [[ -f "$BASE/$f" ]]; then
    ok "$f"
  else
    err "$f が見つかりません"
  fi
done

REQUIRED_DIRS=(
  "tools/scripts"
  "docs"
  "plck-main"
)

for d in "${REQUIRED_DIRS[@]}"; do
  if [[ -d "$BASE/$d" ]]; then
    ok "$d/"
  else
    err "$d/ が見つかりません"
  fi
done

# -----------------------------------------------------------------------------
# 2. 作業ディレクトリの作成
# -----------------------------------------------------------------------------
sect "2. 作業ディレクトリの作成"

WORK_DIRS=(
  "tmp"
  "logs"
  "archive/failed"
)

for d in "${WORK_DIRS[@]}"; do
  if [[ -d "$BASE/$d" ]]; then
    ok "$d/ （存在）"
  else
    if mkdir -p "$BASE/$d" 2>/dev/null; then
      ok "$d/ を作成"
    else
      err "$d/ の作成に失敗（権限・iCloud 同期競合などを確認）"
    fi
  fi
done

# -----------------------------------------------------------------------------
# 3. スクリプトの実行権限
# -----------------------------------------------------------------------------
sect "3. スクリプトの実行権限"

EXECUTABLE_SCRIPTS=(
  "tools/scripts/build_all.sh"
  "tools/scripts/preflight.sh"
  "tools/scripts/verify_zip.sh"
  "tools/scripts/pptx_to_png.sh"
  "tools/scripts/build_unit.sh"
  "tools/scripts/cleanup.sh"
  "scripts/setup.sh"
  "scripts/preflight.sh"
)

for s in "${EXECUTABLE_SCRIPTS[@]}"; do
  if [[ -f "$BASE/$s" ]]; then
    if [[ -x "$BASE/$s" ]]; then
      ok "$s （実行可）"
    else
      if chmod +x "$BASE/$s" 2>/dev/null; then
        ok "$s に実行権限を付与"
      else
        err "$s への chmod +x が失敗（権限・FS 制約を確認）"
      fi
    fi
  fi
done

# -----------------------------------------------------------------------------
# 4. 必須コマンドの確認
# -----------------------------------------------------------------------------
sect "4. 必須コマンドの確認"

check_cmd() {
  local cmd="$1" required="$2" hint="${3:-}"
  if command -v "$cmd" >/dev/null 2>&1; then
    local ver
    ver=$("$cmd" --version 2>&1 | head -1 || echo "(version 取得不可)")
    ok "$cmd  $ver"
  else
    if [[ "$required" == "required" ]]; then
      err "$cmd が見つかりません  $hint"
    else
      warn "$cmd が見つかりません  $hint"
    fi
  fi
}

check_cmd git    required  "Xcode Command Line Tools をインストール: xcode-select --install"
check_cmd bash   required  ""
check_cmd shasum required  "macOS 標準で同梱"
check_cmd zip    required  ""
check_cmd unzip  required  ""
check_cmd node   required  "brew install node"
check_cmd npm    required  "Node.js に同梱"
check_cmd gh     optional  "brew install gh （リモート操作用、必須ではない）"

# PPTX→PNG 用（中国語講座では使わないが、ja-/vi-/en-/pt- では必要）
check_cmd soffice  optional "brew install --cask libreoffice （PPTX→PDF 変換用）"
check_cmd pdftoppm optional "brew install poppler （PDF→PNG 変換用）"
check_cmd identify optional "brew install imagemagick （PNG 寸法検証用）"

# -----------------------------------------------------------------------------
# 5. plck-main の依存解決状態
# -----------------------------------------------------------------------------
sect "5. plck-main 依存解決の状態"

if [[ -f "$BASE/plck-main/package.json" ]]; then
  if [[ -d "$BASE/plck-main/node_modules" ]]; then
    ok "plck-main/node_modules/ が既に存在"
  else
    warn "plck-main/node_modules/ が未生成。次のコマンドを実行してください:"
    echo "    cd plck-main && npm install"
  fi
else
  err "plck-main/package.json が見つかりません"
fi

# -----------------------------------------------------------------------------
# 6. 講座セットフォルダの存在確認
# -----------------------------------------------------------------------------
sect "6. 講座素材の配置確認"

if [[ -d "$BASE/講座セットフォルダ" ]]; then
  COURSE_COUNT=$(find "$BASE/講座セットフォルダ" -maxdepth 1 -type d | wc -l | tr -d ' ')
  ok "講座セットフォルダ/ が存在（$((COURSE_COUNT - 1)) 講座フォルダ）"
else
  warn "講座セットフォルダ/ が未配置です"
  echo "    Google Drive から講座素材を取得して、リポジトリ直下に配置してください。"
  echo "    詳細: docs/folder-structure.md §5"
fi

# -----------------------------------------------------------------------------
# 7. .env の確認
# -----------------------------------------------------------------------------
sect "7. 環境変数ファイル"

if [[ -f "$BASE/.env" ]]; then
  ok ".env が存在"
elif [[ -f "$BASE/.env.example" ]]; then
  warn ".env が無い。必要なら 'cp .env.example .env' を実行"
else
  warn ".env も .env.example も無い"
fi

# -----------------------------------------------------------------------------
# 8. GitHub 認証状態（参考）
# -----------------------------------------------------------------------------
sect "8. GitHub 認証状態（参考）"

if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    gh auth status 2>&1 | head -8 | sed 's/^/    /'
  else
    warn "gh が認証されていません。'gh auth login' で再認証してください"
  fi

  if [[ -d "$BASE/.git" ]]; then
    REMOTE=$(git -C "$BASE" remote get-url origin 2>/dev/null || echo "(remote 未設定)")
    log "git remote origin: $REMOTE"
  fi
else
  warn "gh CLI が無いため、GitHub 認証状態の確認をスキップ"
fi

# -----------------------------------------------------------------------------
# 結果サマリ
# -----------------------------------------------------------------------------
sect "結果サマリ"
log "errors=$ERRORS warnings=$WARNINGS"

if (( ERRORS > 0 )); then
  err "セットアップに致命的な問題があります。上記の ✗ を解消してください"
  exit 1
fi

if (( WARNINGS > 0 )); then
  warn "警告あり。次の手順に進む前に上記の ⚠ を確認してください"
fi

echo
log "セットアップ完了。次のコマンドで preflight チェックを実行してください:"
echo
echo "    $(c_cyan 'bash scripts/preflight.sh')"
echo

exit 0
