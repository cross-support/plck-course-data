# CHANGELOG

このリポジトリの変更履歴。
コミット粒度の小さい変更は git log 参照、運用上の節目はここに記録する。

---

## 2026-04-30

### Verified（実運用検証）

- 別デバイスで `git clone` → `bash scripts/setup.sh` → `./tools/scripts/build_all.sh` → LMS 搭載用 ZIP 生成までの一連のフローを実機検証し、成功を確認。
  「他メンバー・他デバイスでも同手順でセットアップ・運用できる」という当初目的を実運用で達成。

### Added
- B_2026-03-30_PLCK_data を GitHub 管理できるように初期整備
- `README.md` — リポジトリ全体像と入口
- `CLAUDE.md` — ClaudeCode 用作業ルール（GitHub ワークフロー追加）
- `SETUP.md` — 他デバイスでの初回セットアップ手順
- `SKILLS.md` — 作業者に必要なスキル一覧
- `RULES.md` — 運用ルール（命名・配置・コミット・禁止事項）
- `.gitignore` — ソース管理のみ方針（講座素材・ZIP・node_modules・dist 除外）
- `.env.example` — 環境変数のテンプレート
- `docs/folder-structure.md` — フォルダ配置ルール
- `docs/build-flow.md` — 画像差し替え〜ビルド標準手順
- `docs/lms-zip-flow.md` — LMS 搭載用 ZIP 生成詳細
- `docs/translation-rules.md` — 翻訳追加時の言語別ルール（多言語タグ確認含む）
- `docs/tag-rules.md` — 言語タグ・カテゴリタグ運用
- `docs/troubleshooting.md` — 崩れ・不具合発生時の切り分け
- `scripts/setup.sh` — 初回セットアップスクリプト
- `scripts/preflight.sh` — `tools/scripts/preflight.sh` の薄いラッパー（リポジトリ層チェック）

### Notes
- ZIP・PNG・PPTX 等の講座素材は **Git 管理対象外**（容量と再生成可能性の観点）。
  Google Drive 等で別配布する運用。
- リポジトリは **クロスサポートの GitHub アカウント** で private 管理。

---

## 2026-04-21（リポジトリ化前）

- 中国語講座字形崩れ事故を受けて `LMS_BUILD_RULES.md` 初版作成
- `tools/scripts/build_all.sh` / `preflight.sh` / `verify_zip.sh` を整備し、
  事故防止のためのワンコマンドビルドフローを確立

## 2026-04-18（リポジトリ化前）

- `tools/scripts/pptx_to_png.sh` / `build_unit.sh` を新設
- 高画質 PNG 仕様（2668×1500 / 200 DPI）を策定
- ヘッダー CSS を日本語版仕様に統一

---

_最終更新: 2026-04-30_
