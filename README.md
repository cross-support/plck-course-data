# plck-course-data

PLCK（クロスラーニング LMS 用）多言語講座の制作・管理リポジトリ。

> 📌 **ClaudeCode を使う方へ**: このリポジトリは ClaudeCode による作業を前提に設計されています。clone 直後、ClaudeCode に「`README.md` と `CLAUDE.md` を読んで初回セットアップを実行してください」と指示すれば自動でセットアップが進みます（[初回セットアップ手順](#3-初回セットアップ手順)）。

---

## 1. このリポジトリについて

- **目的**: PLCK 講座（多言語版）の制作データ・ビルドスクリプト・運用ルールを 1 か所に集約し、複数メンバー/複数デバイスで再現可能な作業環境を提供する。
- **対象講座**:
  - 日本語（`個人情報の取扱`、`情報セキュリティ` など）
  - 翻訳系（`ベトナム語_よくわかる！ロジスティクスⅠ〜Ⅳ`、`中国語_よくわかる！ロジスティクスⅠ〜Ⅳ`）
  - 今後追加予定: 英語（en-\*）、ポルトガル語（pt-\*）、その他
- **管理対象**:
  - PLCK ビルドシステム（`plck-main/` のソースコード）
  - 制作・ビルド・検証スクリプト（`tools/scripts/`、`scripts/`）
  - 運用ルール・絶対禁則・タグ運用ガイド（`*.md`、`docs/`）
- **管理対象外**（Git に含めない、Google Drive 等で別配布）:
  - 講座素材一式（`講座セットフォルダ/` 配下の PNG / PPTX / PDF）
  - LMS 搭載用 ZIP（再生成可能なため）
  - `node_modules/`、`plck-main/dist/`

> 詳しい配置ルールは [docs/folder-structure.md](docs/folder-structure.md) を参照。

---

## 2. このリポジトリでできること

| カテゴリ | できること | 主な参照先 |
|---|---|---|
| 講座データの管理 | 翻訳講座の言語別整理、UNIT 構成の保持 | [docs/folder-structure.md](docs/folder-structure.md) |
| 講座画像の差し替え | 元 PNG → plck-main 入力 PNG → ZIP の整合性を保ったまま差し替え | [docs/build-flow.md](docs/build-flow.md) |
| LMS 搭載用 ZIP の生成 | `./tools/scripts/build_all.sh` で 24 本一括生成 | [docs/lms-zip-flow.md](docs/lms-zip-flow.md), [LMS_BUILD_RULES.md](LMS_BUILD_RULES.md) |
| 翻訳講座の言語別整理 | vi-\*/zh-\*/en-\*/pt-\* など prefix で識別 | [docs/translation-rules.md](docs/translation-rules.md) |
| ビルド前チェック | `./scripts/preflight.sh` で素材・参照・タグの整合性を検査 | [scripts/preflight.sh](scripts/preflight.sh) |
| ファイル差分確認 | SHA-256 で 元 PNG ⇔ plck 入力 PNG ⇔ ZIP 内 PNG を照合 | [LMS_BUILD_RULES.md](LMS_BUILD_RULES.md) §2 |
| 他デバイスでの再現 | clone → `setup.sh` → `preflight.sh` で同一環境を再構築 | [SETUP.md](SETUP.md) |
| タグ運用 | 言語タグ・カテゴリタグの確認と付与漏れ防止 | [docs/tag-rules.md](docs/tag-rules.md) |

---

## 3. 初回セットアップ手順

### 3-1. ClaudeCode に依頼する場合（推奨）

clone した後、ClaudeCode に次のように依頼してください:

```
このリポジトリの README.md と CLAUDE.md を読んで、初回セットアップを実行してください。
必要な依存関係を確認し、scripts/setup.sh を実行し、preflight チェックまで進めてください。
問題があれば、原因と対応案を整理して報告してください。
```

### 3-2. 人間が手動で進める場合

```bash
git clone <repository-url>
cd plck-course-data
bash scripts/setup.sh
bash scripts/preflight.sh
```

> **注意**: clone しただけでは講座素材（PNG/PPTX/ZIP）は存在しません。`講座セットフォルダ/` の中身は別途 Google Drive 等から取得して配置してください（配置先は [docs/folder-structure.md](docs/folder-structure.md)）。

### 3-3. 必要な環境

詳細は [SETUP.md](SETUP.md) 参照。最低限:

- macOS（M1/M2/Intel）
- Git / GitHub CLI（`gh`）
- bash 5+
- Node.js 18+ / npm（`plck-main` ビルド用）
- LibreOffice、Poppler、ImageMagick（PPTX→PNG 変換時のみ）

---

## 4. 基本的な作業フロー

```
┌──────────────────────────────────────────────────────────────┐
│  1. 元画像・講座データを確認（講座セットフォルダ/）          │
│  2. 対象講座・対象 UNIT を特定                               │
│  3. PNG 差し替え or 翻訳追加（言語タグ・カテゴリ確認）       │
│  4. ./tools/scripts/build_all.sh で 24 本 ZIP 一括再生成     │
│     （内部で preflight + clean build + verify_zip 自動実行）│
│  5. git status / git diff --stat で差分確認                  │
│  6. git add / git commit （1 機能 1 コミット）               │
│  7. push 前に Codex レビューを通す                           │
│  8. git push origin main （クロスサポートアカウント）        │
└──────────────────────────────────────────────────────────────┘
```

> **`./scripts/preflight.sh` の使い分け**: `tools/scripts/preflight.sh`（素材ハッシュ照合）は `build_all.sh` 内で自動実行されるため、通常はステップ 4 だけで足りる。リポジトリ層チェック（必須ドキュメント・`.env` 漏れ・大容量誤コミット）が必要な時だけ `./scripts/preflight.sh` を別途実行する。

詳細は次を参照:
- 画像差し替え → [docs/build-flow.md](docs/build-flow.md)
- LMS 搭載用 ZIP 生成 → [docs/lms-zip-flow.md](docs/lms-zip-flow.md)
- 翻訳・言語追加 → [docs/translation-rules.md](docs/translation-rules.md)
- タグ確認 → [docs/tag-rules.md](docs/tag-rules.md)
- 障害切り分け → [docs/troubleshooting.md](docs/troubleshooting.md)

---

## 5. 注意事項（必読）

このリポジトリの作業で **絶対にやってはいけないこと**:

1. **元画像と LMS 用画像の不一致を放置しない**
   `講座セットフォルダ/.../UNIT{N}/スライド{M}.png` と `plck-main/contents/scenes/slide/{unit_id}/slide/{M}.png` は SHA-256 完全一致が必須。`./scripts/preflight.sh` で常時検証する。

2. **日本語講座と翻訳講座で UI 仕様を変えない**
   ハンバーガーメニュー非表示・タイトル 1 行・ヘッダー色など、日本語版で確立済みの UI を翻訳版でも同じに保つ（[LMS_BUILD_RULES.md](LMS_BUILD_RULES.md) §3、§5）。

3. **スライド比率（16:9）を勝手に変更しない**

4. **翻訳言語が増えた場合は、講座タグ・カテゴリ・言語管理を必ず確認する**
   - **英語講座**が追加されたら → 英語タグの付与確認
   - **ポルトガル語講座**が追加されたら → ポルトガル語タグの付与確認
   - **ベトナム語講座**が追加されたら → ベトナム語タグ・声調記号の正常描画確認
   - **中国語講座**が追加されたら → 中国語タグ・CJK フォント崩れチェック
   - 既存（英語・ポルトガル語）で成立している括弧語・表示名の表示仕様が、ベトナム語・中国語にも反映されるかを確認すること
   - ロジスティクス系の講座には**ロジスティクスのカテゴリタグ**が付いているかを確認

5. **LMS 搭載用 ZIP を古い失敗作と混在させない**
   失敗版は `講座セットフォルダ/.../LMS搭載用ZIP/【旧・*失敗版】/` または `archive/failed/` に隔離する。

6. **個人 GitHub アカウントへ push しない**
   push 先は **クロスサポートの GitHub アカウント** であることを毎回確認（`git remote -v`）。

7. **`.env` や認証情報をコミットしない**

---

## 6. ドキュメント索引

| ファイル | 内容 |
|---|---|
| [README.md](README.md) | このファイル。リポジトリの入口 |
| [CLAUDE.md](CLAUDE.md) | ClaudeCode 用の作業ルール（必読） |
| [LMS_BUILD_RULES.md](LMS_BUILD_RULES.md) | LMS 搭載用 ZIP の絶対ルール（最優先） |
| [SETUP.md](SETUP.md) | 他デバイスでの初回セットアップ手順 |
| [SKILLS.md](SKILLS.md) | 作業者に必要なスキル一覧 |
| [RULES.md](RULES.md) | 運用ルール全般（命名・配置・コミット） |
| [CHANGELOG.md](CHANGELOG.md) | 変更履歴 |
| [tools/README.md](tools/README.md) | PLCK 翻訳講座ビルド標準フロー |
| [docs/folder-structure.md](docs/folder-structure.md) | フォルダ配置ルール |
| [docs/build-flow.md](docs/build-flow.md) | 画像差し替え〜ビルドの標準手順 |
| [docs/lms-zip-flow.md](docs/lms-zip-flow.md) | LMS 搭載用 ZIP 生成詳細 |
| [docs/translation-rules.md](docs/translation-rules.md) | 翻訳追加時の言語別ルール |
| [docs/tag-rules.md](docs/tag-rules.md) | 言語タグ・カテゴリタグ運用 |
| [docs/troubleshooting.md](docs/troubleshooting.md) | 崩れ・不具合発生時の切り分け |

---

## 7. リポジトリ管理方針

- **GitHub アカウント**: クロスサポート（個人アカウントへの push は禁止）
- **可視性**: private
- **コミット粒度**: 1 機能 1 修正 = 1 コミット
- **コミットメッセージ**: 「なぜ」を含める
- **push 前**: 必ず Codex レビュー（[CLAUDE.md](CLAUDE.md) §3）

---

_最終更新: 2026-04-30_
