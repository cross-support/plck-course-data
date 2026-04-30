# docs/build-flow.md — 画像差し替え〜ビルド標準手順

PLCK 講座のスライド画像差し替えからビルドまでの標準手順を定義します。

> ⚠️ **最初に読んでほしいこと**: ビルドに関する**絶対ルール**は [LMS_BUILD_RULES.md](../LMS_BUILD_RULES.md) に集約されています。本ドキュメントは「日常的な作業手順」であり、絶対ルールに矛盾する場合は LMS_BUILD_RULES.md が優先です。

---

## 1. 全体フロー

```
┌────────────────────────────────────────────────────────┐
│  STEP 1: 元 PNG を確認・差し替え（講座セットフォルダ）  │
│  STEP 2: plck-main 入力 PNG にコピー                    │
│  STEP 3: preflight チェック（SHA-256 一致確認）         │
│  STEP 4: ./tools/scripts/build_all.sh で 24 本一括生成 │
│  STEP 5: verify_zip でZIP 整合性確認（自動）            │
│  STEP 6: 目視確認（ブラウザでローカル起動）             │
│  STEP 7: git commit / push（Codex レビュー後）          │
└────────────────────────────────────────────────────────┘
```

---

## 2. 画像差し替え手順

### 2-1. 元 PNG の差し替え（講座セットフォルダ側）

デザイン担当から受領した修正版 PNG で、講座セットフォルダの該当スライドを上書きします。

```bash
BASE="/path/to/plck-course-data"
COURSE="中国語_よくわかる！ロジスティクス入門Ⅰ"
UNIT="UNIT1"
SLIDE_NUM=5  # スライド番号

# バイナリ完全コピー（推奨）
cp -p "/path/to/受領ファイル/スライド${SLIDE_NUM}.png" \
      "$BASE/講座セットフォルダ/$COURSE/$UNIT/スライド${SLIDE_NUM}.png"

# ハッシュ確認
shasum -a 256 "$BASE/講座セットフォルダ/$COURSE/$UNIT/スライド${SLIDE_NUM}.png"
```

### 2-2. plck-main 入力 PNG への反映

```bash
UNIT_ID="zh-logistics01-unit01"

cp -p "$BASE/講座セットフォルダ/$COURSE/$UNIT/スライド${SLIDE_NUM}.png" \
      "$BASE/plck-main/contents/scenes/slide/$UNIT_ID/slide/${SLIDE_NUM}.png"
```

> 注意: ファイル名のリネーム（`スライド5.png` → `5.png`）に伴うバイト変化はありません。`cp -p` でメタ情報も保持してコピーする。

### 2-3. preflight で確認

```bash
cd "$BASE"
bash ./tools/scripts/preflight.sh "$UNIT_ID"
```

**期待出力**:

```
[preflight] OK  zh-logistics01-unit01  (33 PNG, hash all match)
[preflight] preflight OK
```

ハッシュ不一致が出た場合は手順 2-2 のコピーをやり直す。

---

## 3. ビルド実行

### 3-1. 24 本一括ビルド（推奨）

```bash
./tools/scripts/build_all.sh
```

実行内容:

1. `preflight.sh` — 全 24 UNIT の SHA-256 照合 + 中国語講座での pptx 混入禁則チェック
2. `rm -rf plck-main/dist && npx plck build` — クリーンビルド
3. `dist/{unit_id}/` を ZIP 化（24 本）→ `講座セットフォルダ/.../LMS搭載用ZIP/` に配置
4. `verify_zip.sh` — 各 ZIP の構造・参照整合性検証

### 3-2. 単一 UNIT の確認のみ（preflight）

```bash
./tools/scripts/preflight.sh zh-logistics01-unit01
```

### 3-3. ZIP 単体の検証

```bash
./tools/scripts/verify_zip.sh "$BASE/講座セットフォルダ/中国語_よくわかる！ロジスティクス入門Ⅰ/LMS搭載用ZIP/zh_logistics01_unit01.zip"
```

---

## 4. 中国語（zh-\*）講座での特記事項

### ⚠️ Meiryo→Arial 置換は禁止

中国語講座では PPTX → PNG の再レンダリングを行うときに **Meiryo→Arial 置換を絶対に使わない**。Arial は CJK 字形を持たず、OS のフォールバック（明朝系）に落ちて字形が別物になる。

代わりに:

1. デザイン担当が出力した PNG をそのまま使う
2. PPTX → PNG が必要なら PowerPoint または LibreOffice で**フォント置換なし**でレンダリング
3. preflight が必ず ① 元 PNG ⇔ ② plck 入力 PNG の SHA-256 一致を検証する

詳細は [LMS_BUILD_RULES.md §1, §4](../LMS_BUILD_RULES.md) と [translation-rules.md](translation-rules.md)。

---

## 5. ベトナム語（vi-\*）講座での特記事項

### Meiryo→Arial 置換は使ってよい

Arial はベトナム語の声調記号（á à ả ã ạ ă â ê ô ơ ư đ）を正しく描画できる。
PPTX 再レンダリング時は `tools/scripts/pptx_to_png.sh` の置換フローを使用する。

```bash
./tools/scripts/pptx_to_png.sh \
    "/path/to/UNIT1.pptx" \
    "/path/to/講座フォルダ/PNG/UNIT1"
```

---

## 6. 目視確認

ビルド完了後、LMS 搭載前に必ず次を確認:

### 6-1. ローカルでの起動

```bash
cd plck-main
npx plck start zh-logistics01-unit01
# http://localhost:8000/ にアクセス
```

### 6-2. 確認項目

[LMS_BUILD_RULES.md §4-A](../LMS_BUILD_RULES.md) の必須チェックポイント:

- [ ] 各講座 UNIT1 の 1 枚目（タイトル）の字形・改行
- [ ] 中国語講座の **タイトル帯スライド**（ハイライト箇所のフォント切り替わりが無いか）
- [ ] 中国語講座の **長文帯スライド**（明朝化・字間ズレ）
- [ ] ベトナム語講座の **声調記号** の分離有無
- [ ] **数字・英字・記号** のフォント
- [ ] **最終スライド**（完了アイコン★非表示・ハンバーガー非表示・ヘッダーグレー）
- [ ] 任意の **画像 + 文字組み合わせスライド**（被り・空白）

### 6-3. 比較方法

「元 PNG（講座セットフォルダ）」⇔「dist PNG」⇔「LMS 表示」を 3 段階で比較。
macOS のプレビューで 2 枚並べる、または:

```bash
open "$BASE/講座セットフォルダ/.../UNIT1/スライド1.png" \
     "$BASE/plck-main/dist/zh-logistics01-unit01/assets/1-"*.png
```

---

## 7. コミット〜push

### 7-1. 差分確認

```bash
git status
git diff --stat
```

### 7-2. ステージ・コミット（1 機能 1 コミット）

```bash
# 例: スライド差し替えのみのコミット
git add plck-main/contents/scenes/slide/zh-logistics01-unit01/slide/5.png
git commit -m "zh-logistics01-unit01 スライド5 差し替え

理由: デザイン担当からの誤字修正版 PNG に更新。
preflight 通過、verify_zip 通過。"
```

### 7-3. push 前の Codex レビュー

親 [CLAUDE.md](../CLAUDE.md) §3 のルールに従い、Codex レビューを通してから push する。

### 7-4. push

```bash
git remote -v   # クロスサポートアカウントであることを確認
git push origin main
```

---

## 8. 想定外の事態

| 状況 | 対応 |
|---|---|
| preflight が SHA 不一致 | 手順 2-2 のコピーをやり直す。元 PNG が壊れていれば 2-1 から |
| `npx plck build` でエラー | `cd plck-main && rm -rf node_modules && npm install` |
| verify_zip が失敗 | [troubleshooting.md](troubleshooting.md) §3 参照 |
| ZIP が肥大化（>10MB） | クリーンビルドし忘れの可能性。`rm -rf plck-main/dist` してから build_all.sh |
| 中国語スライドが明朝化 | Meiryo→Arial 置換が混入。元 PNG で上書き直す |
| ベトナム語の声調記号が分離 | `pptx_to_png.sh` を使わずに直接作成された PNG の可能性 |

詳細は [troubleshooting.md](troubleshooting.md) を参照。

---

_最終更新: 2026-04-30_
