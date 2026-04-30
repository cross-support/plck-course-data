# SETUP.md — 初回セットアップ手順

このリポジトリを **新しいデバイス / 新しいメンバー** に展開する手順。

---

## 1. 前提環境

### 必須

| ツール | 用途 | 確認コマンド | macOS でのインストール例 |
|---|---|---|---|
| Git | バージョン管理 | `git --version` | Xcode Command Line Tools |
| GitHub CLI (`gh`) | リポジトリ操作・認証 | `gh --version` | `brew install gh` |
| bash 5+ | スクリプト実行 | `bash --version` | macOS は zsh 既定なので `brew install bash` 推奨 |
| Node.js 18+ | `plck-main` ビルド | `node --version` | `brew install node` |
| npm | 依存解決 | `npm --version` | Node.js に同梱 |

### PPTX → PNG 再生成を行う場合のみ

| ツール | 用途 | インストール |
|---|---|---|
| LibreOffice | PPTX → PDF 変換 | `brew install --cask libreoffice` |
| Poppler (`pdftoppm`) | PDF → 高画質 PNG | `brew install poppler` |
| ImageMagick (`identify`) | PNG 寸法検証 | `brew install imagemagick` |

> 中国語（zh-\*）講座では PPTX → PNG 再レンダリングは **禁止**。デザイン担当が出力した PNG をそのまま使う（[LMS_BUILD_RULES.md](LMS_BUILD_RULES.md) §1、§4）。

---

## 2. セットアップ手順（人間の手動実行）

```bash
# 1. リポジトリを clone
git clone <repository-url>
cd plck-course-data   # ※ ローカルではフォルダ名が B_2026-03-30_PLCK_data の場合あり

# 2. 環境変数ファイルを準備（必要に応じて）
cp .env.example .env

# 3. セットアップスクリプト実行
bash scripts/setup.sh

# 4. plck-main の依存解決
cd plck-main
npm install
cd ..

# 5. 講座素材を配置
#    Google Drive 等から「講座セットフォルダ/」配下の素材を取得して配置
#    （配置ルールは docs/folder-structure.md を参照）

# 6. preflight チェック
bash scripts/preflight.sh
```

`scripts/preflight.sh` がすべて緑なら、`./tools/scripts/build_all.sh` で 24 本の LMS 搭載用 ZIP が生成可能な状態です。

---

## 3. ClaudeCode に依頼する場合

新規セッションを開いて、次のようにお願いしてください:

```
このリポジトリの README.md、CLAUDE.md、SETUP.md を読んでください。
初回セットアップを実行し、必要な依存関係を確認し、scripts/setup.sh と
preflight チェックまで実行してください。
講座素材が未配置の場合はその旨を報告し、配置先のパスを案内してください。
問題があれば、原因と対応案を整理して報告してください。
```

ClaudeCode は以下を自動で行います:

1. CLAUDE.md / LMS_BUILD_RULES.md / docs/ 一式の読込
2. `gh auth status` と `git remote -v` で push 先がクロスサポートアカウントか確認
3. `scripts/setup.sh` 実行
4. `scripts/preflight.sh` 実行（FAIL の場合は原因切り分けまで）
5. 結果報告

---

## 4. GitHub 認証の確認

push 先が必ず **クロスサポートのアカウント** であることを確認してください。

```bash
# 認証中のアカウントを確認
gh auth status

# リモートの向き先を確認
git remote -v
```

期待される出力:

```
✓ Logged in to github.com account cross-support
origin  git@github.com:cross-support/plck-course-data.git (fetch)
origin  git@github.com:cross-support/plck-course-data.git (push)
```

異なるアカウントが Active になっている場合:

```bash
# 別アカウントで再ログイン
gh auth login -h github.com
# あるいはアカウント切替
gh auth switch -u cross-support
```

---

## 5. 講座素材の取得（重要）

このリポジトリには `.gitignore` により講座素材（PNG/PPTX/PDF/ZIP）は含まれていません。
別途以下から取得してください:

- **共有元**: Google Drive `共有ドライブ > クロスラーニング > 講座セットフォルダ`（運用上のパスは PM に確認）
- **配置先**: リポジトリ直下の `講座セットフォルダ/`
- **配置構造**: [docs/folder-structure.md](docs/folder-structure.md) 参照

---

## 6. トラブルシュート

| 症状 | 対応 |
|---|---|
| `gh auth status` で token invalid | `gh auth login` で再認証。組織アカウントは SSO を要求される場合あり |
| `npm install` で permission エラー | `node_modules` を削除して再実行。`sudo` は使わない |
| `preflight.sh` が「元PNGが0枚」 | 講座素材が未配置。手順 5 を実施 |
| `preflight.sh` が SHA-256 不一致 | [docs/troubleshooting.md](docs/troubleshooting.md) §1 参照 |
| `npx plck build` で type エラー | `cd plck-main && npm install` を実行 |

詳細は [docs/troubleshooting.md](docs/troubleshooting.md) を参照。

---

_最終更新: 2026-04-30_
