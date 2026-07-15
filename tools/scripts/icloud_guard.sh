#!/usr/bin/env bash
# =============================================================================
# icloud_guard.sh
#   iCloud 同期競合による ZIP 破損を防ぐ「掃除」＋「ガード」。
#
# 背景（2026-07-15 実障害）:
#   本リポジトリは iCloud Drive 配下（Mobile Documents/com~apple~CloudDocs/…）に
#   あり、ビルド中に iCloud が同期競合を起こすと
#     - "<name> 2" という複製ディレクトリ/ファイル
#     - dist/<unit>/assets が "assets" と "assets 2" に分裂
#   が発生する。index.html は "./assets/index-<hash>.js" のようにハッシュ資産を
#   名指しするため、その実体が "assets 2/" 側へ取り残されたまま ZIP 化すると、
#   LMS で該当ファイルが 404 になりページが開かない（zh-logistics01-unit01 で発生）。
#   末尾 " 2"（スペース+数字）は Vite も zip も生成しない＝iCloud/Finder の競合命名。
#
# 提供機能:
#   source して関数利用:
#     plck_clean_icloud_conflicts <dir>      空の競合複製「のみ」削除（実データは消さない）
#     plck_assert_no_icloud_conflicts <dir>  非空の競合が残れば非ゼロ終了（ZIP化前ガード）
#   直接実行（個別ビルド手順用の一発ガード）:
#     icloud_guard.sh <dir>                  clean → assert を実行
# =============================================================================

# 競合エントリ（末尾 " <数字>" の dir / file）を列挙する。
# 観測される実パターンは " 2"。1〜2桁（" 2".." 99"）を対象にし、verify_zip.sh の
# 検査(7)（正規表現 " [0-9]+"）と実質同じカバレッジにしてある（多重競合の取りこぼし防止）。
_plck_find_conflicts() {
  local dir="$1"
  [[ -d "$dir" ]] || return 0
  find "$dir" \
    \( -type d \( -name '* [0-9]' -o -name '* [0-9][0-9]' \) \) -o \
    \( -type f \( -name '* [0-9]'    -o -name '* [0-9].*' \
               -o -name '* [0-9][0-9]' -o -name '* [0-9][0-9].*' \) \) \
    2>/dev/null
}

# 空の競合複製だけを削除する。中身のある競合は触らない（assert 側で中止させる）。
plck_clean_icloud_conflicts() {
  local dir="$1" entry
  [[ -d "$dir" ]] || return 0
  while IFS= read -r entry; do
    [[ -n "$entry" ]] || continue
    if [[ -d "$entry" ]]; then
      # 配下に実ファイルが 1 つも無い＝空の競合ディレクトリのみ削除
      if [[ -z "$(find "$entry" -type f -print -quit 2>/dev/null)" ]]; then
        rm -rf "$entry" && printf '[icloud_guard] 掃除(空の競合dir): %s\n' "$entry" >&2
      fi
    elif [[ -f "$entry" && ! -s "$entry" ]]; then
      # 0 バイトの競合ファイルのみ削除
      rm -f "$entry" && printf '[icloud_guard] 掃除(空の競合file): %s\n' "$entry" >&2
    fi
  done < <(_plck_find_conflicts "$dir")
  return 0
}

# 非空の競合（＝実データを持つ分裂）が残っていたら中止させる。
plck_assert_no_icloud_conflicts() {
  local dir="$1" left
  [[ -d "$dir" ]] || return 0
  left="$(_plck_find_conflicts "$dir")"
  if [[ -n "$left" ]]; then
    printf '\033[1;31m[icloud_guard][FATAL] iCloud 同期競合が残存（非空）。ZIP化を中止します。\033[0m\n' >&2
    printf '%s\n' "$left" | sed 's/^/  - /' >&2
    printf '対処: ① iCloud 同期の完了を待って再実行 / ② 非iCloudローカル（例 ~/plck-build/）で再ビルド。\n' >&2
    printf '      競合側に実ファイルがあるため、そのまま ZIP 化すると資産が正パスに無く LMS で 404 になります。\n' >&2
    return 1
  fi
  return 0
}

# 直接実行時: clean → assert（非空競合が残れば非ゼロで終了）
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  target="${1:-}"
  if [[ -z "$target" ]]; then
    echo "Usage: $0 <dir>   # 空の競合を掃除し、非空の競合が残れば非ゼロ終了" >&2
    exit 2
  fi
  plck_clean_icloud_conflicts "$target"
  plck_assert_no_icloud_conflicts "$target"
fi
