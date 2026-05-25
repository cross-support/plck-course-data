# CLAUDE.md — B_2026-03-30_PLCK_data プロジェクトルール

## 🔰 セッション開始時の最初のふるまい（必須）

**ユーザーが最初のメッセージで「今日やりたいこと」を明示していない場合、Claude Code はまず以下を実行すること:**

1. `CLAUDE.md`（本ファイル）と `LMS_BUILD_RULES.md` を読む
2. **次の一文をユーザーに最初に返す**:

   > 「今日はどんな対応が必要な日ですか？以下のいずれかに近いものがあれば教えてください。該当しない場合は内容を自由に教えてください。」
   >
   > - **① LMS 搭載だけの日** — 既存 ZIP を LMS に載せるだけ（ZIP 存在確認で足りる）
   > - **② 再ビルドが必要な日** — 元 PNG 差し替え・ヘッダー CSS 修正など、plck-main 側の変更があった
   > - **③ 新規講座を追加する日** — 新しい言語/講座/UNIT を追加する
   > - **④ 障害・不具合の切り分け** — LMS 上で崩れた・文字化けなど
   > - **⑤ その他** — ルール追加・運用見直し・軽微な修正など

3. ユーザーの回答を受けて、対応する節（本 §1〜§4 および `LMS_BUILD_RULES.md`）を参照し、勝手に再発明せず既存レール（`./tools/scripts/build_all.sh` など）に乗って進める。

**例外:** ユーザーが 1 つ目のメッセージで「今日は UNIT2 の PNG を差し替えたい」など具体的な作業を既に指示している場合は、この質問をスキップして直ちにその作業に着手する。

---

## 0. 本プロジェクトで最初に読むべき文書

セッション開始時に以下を必ず参照すること。

1. **[LMS_BUILD_RULES.md](./LMS_BUILD_RULES.md)** — LMS 搭載用 ZIP 作成の絶対ルール（**最優先**）
2. [README.md](./README.md) — リポジトリ全体像と入口
3. [RULES.md](./RULES.md) — 運用ルール（命名・配置・コミット・禁止事項）
4. [tools/README.md](./tools/README.md) — PLCK 翻訳講座ビルド標準フロー
5. [docs/translation-rules.md](./docs/translation-rules.md) — 翻訳追加時の言語別ルール
6. [docs/tag-rules.md](./docs/tag-rules.md) — 言語タグ・カテゴリタグ運用
7. [docs/troubleshooting.md](./docs/troubleshooting.md) — 崩れ発生時の切り分け（簡易版は本ファイル §2）

## 1. LMS 搭載用 ZIP を作る作業のときの必須手順

### 正式な手順（推奨：1 コマンド）

```bash
./tools/scripts/build_all.sh
```

これだけで **事前チェック → クリーンビルド → 全 80 ZIP 生成 → ZIP 検証** が自動で走り、
事故条件に該当した段階で**停止**します。手動でのビルドは原則禁止。

### 何が自動化されているか
1. `preflight.sh` — 元PNG⇔plck入力PNGのSHA-256照合、中国語(zh-\*)のpptx/pdf混入検出、枚数整合
2. `rm -rf plck-main/dist && npx plck build` — クリーンビルド（index-\*.js/css の残骸累積を根絶）
3. 80本ZIP生成（vi/zh ロジスティクス 24本 + 日本語講座 56本。`.gitkeep`/`.DS_Store`/`__MACOSX`除外、`zip -X` で extra attr排除）
4. `verify_zip.sh` — ルート直下の index.html 存在・参照JS/CSSの実在・累積重複ゼロ・macOSメタ無混入

### 覚えておくべき 3 つの禁則
1. **中国語 (zh-\*) 講座では `pptx_to_png.sh` / `build_unit.sh` の Meiryo→Arial 置換を使わない**（Arial に CJK 字形が無く明朝化する）
2. **`plck-main/contents/scenes/slide/{unit}/slide/*.png` は 講座セットフォルダの元 PNG と SHA-256 完全一致を保つ**
3. **差分ビルド禁止。必ずクリーンビルド**（残骸累積で ZIP が肥大化する）

## 2. 崩れ発生時の切り分け最短ルート

上から順に確認し、**最初に差分が出た工程を修正**すれば下流は再実行で直る。

| 工程 | ファイル位置 | 照合方法 |
|---|---|---|
| ① 元 PNG | `講座セットフォルダ/{言語}_{講座名}/UNIT{N}/スライド{M}.png` | デザインと目視一致 |
| ② plck 入力 PNG | `plck-main/contents/scenes/slide/{unit_id}/slide/{M}.png` | `shasum -a 256` が ① と一致 |
| ③ dist PNG | `plck-main/dist/{unit_id}/assets/{M}-*.png` | `shasum -a 256` が ② と一致 |
| ④ ZIP 内 PNG | `{ZIP}/assets/{M}-*.png` | `unzip -p ZIP PATH | shasum -a 256` が ③ と一致 |
| ⑤ LMS 表示 | ブラウザ実機 | ①〜④ 一致なら LMS 側要因を疑う |

## 3. 全体の運用ルール（親 CLAUDE.md 由来）

ユーザー全体 CLAUDE.md (`/Users/apple/CLAUDE.md`) のルールも併せて遵守:

- Git: 1 機能 1 コミット、コミットメッセージは「なぜ」を含める
- push 前は必ず Codex レビューを挟む
- サブエージェント委任を基本とし、メインは PM 的に立ち回る

### 3-1. ClaudeCode 作業ルール（要点のみ。詳細は [RULES.md](./RULES.md)）

- **既存構成を勝手に壊さない**。既存スクリプト・既存ルールを優先する
- **作業前に必ず**: `pwd && git status && git remote -v` を確認
- **大量変更前**は差分プランをユーザーに提示し承認を得る
- **画像・ZIP・生成物の上書きには特に注意**（旧版は `【旧・*失敗版】/` に退避）
- **push 先確認**: `git remote -v` がクロスサポートのアカウントであること（個人アカウント禁止）
- **`.env` や認証情報の commit 禁止**

### 3-2. 翻訳・言語タグルール（詳細は [docs/translation-rules.md](./docs/translation-rules.md), [docs/tag-rules.md](./docs/tag-rules.md)）

新言語講座が追加されたら、必ず以下を確認:

- 言語タグ（日本語/英語/ポルトガル語/ベトナム語/中国語）が付与されているか
- 既存（英語・ポルトガル語）で成立している括弧語・表示名がベトナム語・中国語にも反映されているか
- ロジスティクス系講座には**ロジスティクスのカテゴリタグ**が付いているか
- 中国語（zh-\*）では Meiryo→Arial 置換**禁止**（§1 既出）

### 3-3. 禁止事項

1. 既存講座データの無断削除
2. 生成済み ZIP の無断上書き
3. UI 構成の勝手な変更（ヘッダー色・タイトル行数・ハンバーガー有無 等）
4. 画像比率（16:9）の変更
5. 日本語講座と翻訳講座で表示仕様を変えること
6. 個人 GitHub アカウントへの push
7. `.env` や認証情報の commit
8. preflight が FAIL したまま ZIP を本番配置すること

## 4. 対象講座（2026-05 時点）

- `ベトナム語_よくわかる！ロジスティクス入門Ⅰ〜Ⅳ`（各 UNIT1〜UNIT3）
- `中国語_よくわかる！ロジスティクス入門Ⅰ〜Ⅳ`（各 UNIT1〜UNIT3）
- `個人情報の取扱`（UNIT1〜UNIT4）
- `情報セキュリティ`（UNIT1〜UNIT4）
- `セクシャルハラスメント防止の基本`（UNIT1〜UNIT4）
- `パワーハラスメント防止の基本`（UNIT1〜UNIT4）
- `ビジネス文書の基本`（UNIT1〜UNIT4）
- `報告書・議事録の作成術`（UNIT1〜UNIT4）
- `クレーム対応の実践`（UNIT1〜UNIT4）
- `電話応対の基本マナー`（UNIT1〜UNIT4）
- `ワークスキル実践講座Ⅰ（基礎編）`（UNIT1〜UNIT8）
- `ワークスキル実践講座Ⅱ（実践編）`（UNIT1〜UNIT8）
- `ワークスキル実践講座Ⅲ（自律編）`（UNIT1〜UNIT8）

全対象は `tools/scripts/build_all.sh` の `PAIRS` と `JP_UNITS` を正本とする。

plck-main 側 unit_id マッピング:

| 講座フォルダ | plck unit_id prefix |
|---|---|
| ベトナム語_よくわかる！ロジスティクス入門Ⅰ | vi-logistics01 |
| ベトナム語_よくわかる！ロジスティクス入門Ⅱ | vi-logistics02 |
| ベトナム語_よくわかる！ロジスティクス入門Ⅲ | vi-logistics03 |
| ベトナム語_よくわかる！ロジスティクス入門Ⅳ | vi-logistics04 |
| 中国語_よくわかる！ロジスティクス入門Ⅰ | zh-logistics01 |
| 中国語_よくわかる！ロジスティクス入門Ⅱ | zh-logistics02 |
| 中国語_よくわかる！ロジスティクス入門Ⅲ | zh-logistics03 |
| 中国語_よくわかる！ロジスティクス入門Ⅳ | zh-logistics04 |

各 UNIT は `{prefix}-unit0{1,2,3}`。ZIP 名はハイフンをアンダースコアに変換した形（例: `zh_logistics01_unit01.zip`）。

---

_最終更新: 2026-05-25_
