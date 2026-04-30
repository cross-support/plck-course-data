# SKILLS.md — このリポジトリで必要な作業スキル

このリポジトリで作業するための「最低限知っておいてほしいこと」を整理します。
作業者は本ファイルを最初に読み、不足するスキルがあれば PM に相談してください。

---

## 1. 必須スキル

### 1-1. Git / GitHub

- `git status` / `git diff` / `git log` で現在の状態を読み取れる
- `git add` で **特定ファイルだけを** ステージできる（`git add .` は禁止）
- `git commit -m "..."` でコミットできる
- ブランチを切って `git push origin <branch>` できる
- `gh pr create` で PR を作れる
- リモートが向いている GitHub アカウント（`git remote -v`）を確認できる

### 1-2. ClaudeCode での作業指示

- ClaudeCode に「README.md と CLAUDE.md を読んで」と指示できる
- 作業前に「対象ファイルを読んで現状を報告して」と頼める
- 大量変更は「先にプランを出して」と頼んで承認後に実行させる
- 失敗ログは「原因と切り分け案を整理して」と依頼できる

### 1-3. 講座フォルダ構造の理解

- `講座セットフォルダ/{言語}_{講座名}/UNIT{N}/スライド{M}.png` の意味を理解している
- `plck-main/contents/scenes/slide/{unit_id}/slide/{M}.png` が plck ビルドの入力であることを理解している
- 上記 2 つは **SHA-256 完全一致が必須** であることを理解している
- `unit_id` は `{lang}-{course}-unit0{1,2,3}` 形式（例: `zh-logistics01-unit01`）

詳細は [docs/folder-structure.md](docs/folder-structure.md)。

### 1-4. PNG 画像の差し替え

- macOS の Finder ではなく、ターミナル（`cp` / `rsync`）でバイナリ完全コピーができる
- `shasum -a 256 file.png` でハッシュを取得して比較できる
- macOS のファイル名が NFD（濁点分離）であることを意識して `find -name` の落とし穴を避けられる

### 1-5. LMS 搭載用 ZIP の生成

- `./tools/scripts/build_all.sh` を実行できる
- 失敗時にログを読んで止まった段階を特定できる（preflight / build / zip / verify_zip）
- 単一 UNIT のみ検査するなら `./tools/scripts/preflight.sh zh-logistics01-unit01`
- 生成された ZIP の格納先は `講座セットフォルダ/.../LMS搭載用ZIP/{lang}_{course}_unit0{N}.zip`

### 1-6. 多言語講座の管理

- prefix（`ja-` / `vi-` / `zh-` / `en-` / `pt-` / `ko-` / `tl-`）の意味を理解している
- 言語ごとのフォント禁則を理解している（[docs/translation-rules.md](docs/translation-rules.md)）
- 中国語（zh-\*）では Meiryo→Arial 置換が **禁止** であることを覚えている

### 1-7. タグ・カテゴリ管理

- 言語タグ（日本語・英語・ポルトガル語・ベトナム語・中国語）の付与漏れを検出できる
- カテゴリタグ（ロジスティクス・ビジネスマナー・安全教育 等）の付与漏れを検出できる
- 既存講座と新規追加講座でタグの整合が取れているか確認できる

詳細は [docs/tag-rules.md](docs/tag-rules.md)。

### 1-8. Preflight チェックの確認

- `bash scripts/preflight.sh` を読んで PASS / FAIL を判別できる
- FAIL したときに「どの工程で止まったか」を [docs/troubleshooting.md](docs/troubleshooting.md) に照らして切り分けられる

---

## 2. 作業者向けの注意（やりがちなミス）

### 2-1. 「画像差し替えだけ」に見えても LMS 用 ZIP まで影響する

- 元 PNG を 1 枚差し替えただけでも、`plck-main/contents/scenes/slide/...` への反映、`npx plck build` の再実行、ZIP の再生成、`verify_zip.sh` までを通さないと LMS 表示が崩れる。
- 「ファイルだけ Finder で上書きして終わり」は禁止。

### 2-2. 翻訳講座は言語タグの付け忘れが起きやすい

- 新言語の講座を追加した直後は、必ず管理画面 / LMS 側で言語タグが付いているかを確認する。
- 既存（英語・ポルトガル語）で成立している表示仕様（括弧語・表示名）が、ベトナム語・中国語にも反映されるかを並べて確認する。

### 2-3. ロジスティクスなど講座カテゴリタグも確認する

- ロジスティクス系 8 講座（vi-/zh- × Ⅰ〜Ⅳ）には**ロジスティクスのカテゴリタグ**が必須。
- 言語タグだけ付けて満足し、カテゴリタグを付け忘れる事故が起きやすい。

### 2-4. 表示名・括弧語・タグの連動を確認する

- 表示名: 例 `よくわかる！ロジスティクス入門Ⅰ（中国語）`
- 括弧語: `（中国語）` `（ベトナム語）` `（English）` `（Português）` などの言語表記
- これらが管理画面・LMS・サムネイル・カテゴリページで一貫しているか確認する。

### 2-5. 作業完了後は必ず差分確認する

- `git diff --stat` で「思ってもいないファイルが変更されていないか」を確認する。
- 特に `plck-main/dist/` や `node_modules/` が紛れていないかを確認（`.gitignore` で除外しているはずだが、強制 add していたら漏れる）。
- 大きすぎる ZIP / PNG をうっかり追加していないかも確認。

### 2-6. push 前に Codex レビューを通す

- リポジトリ全体ルール（[CLAUDE.md](CLAUDE.md)）で push 前 Codex レビューが必須。
- 指摘事項を修正した後、再レビュー → push の順で運用。

---

## 3. 推奨される学習リソース

| トピック | 参照先 |
|---|---|
| PLCK 本体の使い方 | `plck-main/README.md` |
| 翻訳講座ビルド標準フロー | [tools/README.md](tools/README.md) |
| LMS 搭載ルールの根拠 | [LMS_BUILD_RULES.md](LMS_BUILD_RULES.md)（事故記録あり） |
| ClaudeCode 公式ドキュメント | https://docs.anthropic.com/claude/docs/claude-code |
| GitHub CLI | https://cli.github.com/manual/ |

---

_最終更新: 2026-04-30_
