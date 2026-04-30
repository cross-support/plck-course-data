# docs/lms-zip-flow.md — LMS 搭載用 ZIP 生成詳細

LMS（クロスラーニング LMS）に搭載する ZIP の生成手順・命名規則・配置先・検証項目をまとめます。

> 🚨 **絶対ルール**: [LMS_BUILD_RULES.md](../LMS_BUILD_RULES.md) が最優先。本ファイルは運用手順書。

---

## 1. 生成方法

### 1-1. 全 24 本一括生成（推奨）

```bash
cd plck-course-data
./tools/scripts/build_all.sh
```

実行ステップ:

| Step | 内容 | 失敗時の停止 |
|---|---|---|
| 1/4 | `preflight.sh` — 元PNG⇔plck入力PNG SHA-256 照合・中国語禁則 | 即停止 |
| 2/4 | `rm -rf dist && npx plck build` クリーンビルド | 即停止 |
| 3/4 | 24 本 ZIP 生成 → 各講座の `LMS搭載用ZIP/` に配置 | 即停止 |
| 4/4 | `verify_zip.sh` で ZIP 内構造・参照整合性検証 | 即停止 |

### 1-2. 緊急用: preflight をスキップ（非推奨）

```bash
./tools/scripts/build_all.sh --skip-preflight
```

> 事故防止のため通常運用では使わない。

---

## 2. 出力先

```
講座セットフォルダ/{講座名}/LMS搭載用ZIP/
├── {prefix//-/_}_unit01.zip
├── {prefix//-/_}_unit02.zip
├── {prefix//-/_}_unit03.zip
└── 【旧・*失敗版】/             # 過去の失敗作の退避場所
```

例:

```
講座セットフォルダ/中国語_よくわかる！ロジスティクス入門Ⅰ/LMS搭載用ZIP/
├── zh_logistics01_unit01.zip
├── zh_logistics01_unit02.zip
├── zh_logistics01_unit03.zip
└── 【旧・2026-04-21失敗版】/
```

---

## 3. ZIP 命名規則

```
{prefix}_{unit}.zip
```

| 講座 | unit_id (内部) | ZIP 名 |
|---|---|---|
| ベトナム語 ロジⅠ UNIT1 | `vi-logistics01-unit01` | `vi_logistics01_unit01.zip` |
| 中国語 ロジⅢ UNIT2 | `zh-logistics03-unit02` | `zh_logistics03_unit02.zip` |
| 個人情報の取扱 UNIT1 | `privacy-unit01` | `privacy_unit01.zip` |

ハイフン → アンダースコアに変換、unit_id 全体を小文字で。

---

## 4. ZIP 内部の構造（必須要件）

```
{prefix}_{unit}.zip
├── index.html              # ★ルート直下に存在必須
├── favicon.ico
├── assets/
│   ├── index-{hash}.js     # ★1 個のみ（累積禁止）
│   ├── index-{hash}.css    # ★1 個のみ（累積禁止）
│   ├── 1-{hash}.png
│   ├── 2-{hash}.png
│   └── ...
└── img/                    # 静的画像（あれば）
```

**禁止事項**:

- ZIP ルート直下に `index.html` が無い（1 階層深いラップ）
- `__MACOSX/`、`.DS_Store`、`/._` などの macOS メタが混入
- `index-*.js` / `index-*.css` が複数（差分ビルドで残骸が累積）
- 参照されている `assets/index-{hash}.js` が ZIP 内に存在しない

---

## 5. 検証項目（`verify_zip.sh` が自動実行）

| 検証項目 | 期待値 | 違反時の挙動 |
|---|---|---|
| ルート直下に `index.html` がある | 1 ファイル | 即エラー |
| `__MACOSX` / `.DS_Store` / `/._` が無い | 0 ファイル | 即エラー |
| `index.html` 内の参照 JS/CSS が ZIP 内に存在 | すべて存在 | 即エラー |
| `index-*.js` の数 | 1 | 累積エラー |
| `index-*.css` の数 | 1 | 累積エラー |
| `favicon.ico` が存在 | 1 ファイル | 警告 |

手動検証コマンド:

```bash
ZIP="path/to/zh_logistics01_unit01.zip"

# ルート直下に index.html があるか
unzip -l "$ZIP" | grep -E "^\s+\d+\s+[0-9-]+ [0-9:]+\s+index\.html$"

# macOS メタが無いか
unzip -l "$ZIP" | grep -E "__MACOSX|DS_Store|/\._" && echo NG || echo CLEAN

# index.html 参照ファイルが ZIP 内に存在するか
unzip -p "$ZIP" index.html | grep -oE 'assets/index-[a-z0-9]+\.(js|css)' | while read ref; do
  unzip -l "$ZIP" | grep -q "$ref" && echo "OK $ref" || echo "MISSING $ref"
done

# 累積残骸チェック（各 1 個のみが正常）
echo "js count: $(unzip -l "$ZIP" | grep -cE 'assets/index-.*\.js$')"
echo "css count: $(unzip -l "$ZIP" | grep -cE 'assets/index-.*\.css$')"
```

---

## 6. ZIP 化前の必須チェック（人間 / ClaudeCode 共通）

`build_all.sh` を使う限り自動化されているが、手動運用する場合は次を必ず通す:

1. `rm -rf plck-main/dist && cd plck-main && npx plck build` で完全クリーンビルド
2. `plck-main/contents/scenes/slide/{unit_id}/slide/*.png` と `講座セットフォルダ/.../UNIT{N}/スライド*.png` の SHA-256 全件一致を確認
3. `dist/{unit_id}/assets/{N}-*.png` の SHA-256 を抜き取り確認
4. `dist/{unit_id}/index.html` の `src="./assets/index-*.js"` が `dist/{unit_id}/assets/` に実在
5. `dist/{unit_id}/` 直下に重複した `index-*.js` / `index-*.css` が無い

---

## 7. 失敗作の隔離方法

過去の失敗作を上書きしない。退避してから新版を配置:

```bash
LMS_DIR="$BASE/講座セットフォルダ/中国語_よくわかる！ロジスティクス入門Ⅰ/LMS搭載用ZIP"
TIMESTAMP=$(date +%Y-%m-%d)

mkdir -p "$LMS_DIR/【旧・${TIMESTAMP}失敗版】"
mv "$LMS_DIR"/*.zip "$LMS_DIR/【旧・${TIMESTAMP}失敗版】/" 2>/dev/null || true

# 新版生成
./tools/scripts/build_all.sh
```

---

## 8. CHANGELOG への記録

ZIP を再生成したら `CHANGELOG.md` に 1 行記録:

```markdown
## 2026-04-21
- zh-logistics01〜04 全UNIT 再生成（中国語フォント崩れ修正、preflight + verify_zip 通過）
```

---

## 9. LMS 側（クロスラーニング LMS）のアップロード作業

ZIP の生成後、LMS への搭載作業は管理画面で行う。具体的な手順は LMS 管理画面ガイドに従う（本リポジトリ管轄外）。

ZIP 検証結果は LMS にアップロードする前に必ず通すこと。崩れたまま LMS に上げると、各受講者の進捗データに影響が出る場合がある。

---

_最終更新: 2026-04-30_
