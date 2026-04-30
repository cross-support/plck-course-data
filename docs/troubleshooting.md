# docs/troubleshooting.md — トラブルシュート

LMS 表示崩れ・ビルド失敗・preflight 失敗が発生したときの切り分け手順。

> 🚨 [LMS_BUILD_RULES.md §9](../LMS_BUILD_RULES.md) の「問題があった場合の切り分け手順（工程単位）」が原典です。

---

## 1. LMS 表示が崩れたとき（最短切り分け）

### 1-1. 工程ごとに上から順に確認

**最初に差分が出た工程を修正**すれば、下流は再実行で直る。

| # | 工程 | ファイル位置 | 照合方法 |
|---|---|---|---|
| ① | 元 PNG | `講座セットフォルダ/{言語}_{講座名}/UNIT{N}/スライド{M}.png` | デザインと目視一致 |
| ② | plck 入力 PNG | `plck-main/contents/scenes/slide/{unit_id}/slide/{M}.png` | `shasum -a 256` が ① と一致 |
| ③ | dist PNG | `plck-main/dist/{unit_id}/assets/{M}-*.png` | `shasum -a 256` が ② と一致 |
| ④ | ZIP 内 PNG | `{ZIP}/assets/{M}-*.png` | `unzip -p ZIP PATH \| shasum -a 256` が ③ と一致 |
| ⑤ | LMS 表示 | ブラウザ実機 | ①〜④ 一致なら LMS 側要因を疑う |

### 1-2. 切り分け手順

```bash
BASE="/path/to/plck-course-data"
UNIT_ID="zh-logistics01-unit01"
COURSE="中国語_よくわかる！ロジスティクス入門Ⅰ"
UNIT="UNIT1"
SLIDE=5

# 元 PNG
SRC=$(shasum -a 256 "$BASE/講座セットフォルダ/$COURSE/$UNIT/スライド${SLIDE}.png" | awk '{print $1}')

# plck 入力 PNG
PLCK=$(shasum -a 256 "$BASE/plck-main/contents/scenes/slide/$UNIT_ID/slide/${SLIDE}.png" | awk '{print $1}')

# dist PNG
DIST=$(shasum -a 256 "$(ls $BASE/plck-main/dist/$UNIT_ID/assets/${SLIDE}-*.png)" | awk '{print $1}')

echo "src=$SRC"
echo "plck=$PLCK"
echo "dist=$DIST"

# 期待: 3 つすべて同じハッシュ
```

### 1-3. 不一致時の対応

| 工程 | 不一致の意味 | 対応 |
|---|---|---|
| ① ⇔ ② | plck 入力 PNG が古い | 元 PNG を `cp -p` で上書き |
| ② ⇔ ③ | クリーンビルドしていない | `rm -rf plck-main/dist && cd plck-main && npx plck build` |
| ③ ⇔ ④ | ZIP 化に問題 | `build_all.sh` を再実行（zip エラーの可能性） |
| ④ ⇔ ⑤ | LMS 側で再描画 / CSS 注入 | LMS 設定を確認、CSS のオーバーライド有無を疑う |

---

## 2. preflight が FAIL したとき

### 2-1. SHA-256 不一致エラー

```
[preflight][ERROR] zh-logistics01-unit01: PNG SHA-256 不一致 slide=5 src=abc123 plck=def456
（中国語: Meiryo→Arial置換の副作用が疑われます。元PNGで上書きし直してください）
```

**対応**:

```bash
cp -p "$BASE/講座セットフォルダ/中国語_.../UNIT1/スライド5.png" \
      "$BASE/plck-main/contents/scenes/slide/zh-logistics01-unit01/slide/5.png"

# 再検査
./tools/scripts/preflight.sh zh-logistics01-unit01
```

### 2-2. 中国語ユニットに pptx/pdf が混入

```
[preflight][ERROR] zh-logistics01-unit01: 中国語ユニットに pptx/pdf が混入 (1 件)
```

**対応**:

```bash
# 不要な pptx/pdf を削除
find "$BASE/plck-main/contents/scenes/slide/zh-logistics01-unit01/slide" \
     -maxdepth 1 \( -name '*.pptx' -o -name '*.pdf' \) -delete
```

### 2-3. 枚数不一致

```
[preflight][ERROR] zh-logistics01-unit01: 枚数不一致 src=33 plck=32
```

**対応**: 元 PNG とビルド入力の枚数が違う。最新の元 PNG をすべてコピーし直す。

```bash
# 一括コピー（同期）
rsync -a --delete \
    "$BASE/講座セットフォルダ/中国語_.../UNIT1/" \
    /tmp/work/

# 連番ファイル名にリネームしてから配置
# （詳細手順は build-flow.md 参照）
```

### 2-4. 元 PNG が 0 枚

```
[preflight][ERROR] zh-logistics01-unit01: 元PNGが0枚。講座セットフォルダに素材が無い
```

**対応**: 講座素材が未配置。Google Drive から取得して `講座セットフォルダ/` に配置（[SETUP.md §5](../SETUP.md)）。

---

## 3. verify_zip が FAIL したとき

### 3-1. ルート直下に index.html が無い

ZIP が 1 階層深くラップされている。

```
{prefix}_{unit}.zip
└── {unit_id}/             # ← この階層が余分
    └── index.html
```

**対応**: `build_all.sh` 内の `cd "$src" && zip -rqX ...` の `cd` を確認。`build_all.sh` 経由で生成すれば自動的に正しい構造になる。

### 3-2. macOS メタが混入

```
verify_zip: macOS メタファイルが混入: __MACOSX/...
```

**対応**: `zip -X` フラグで extra attr を排除。`build_all.sh` は対応済み。手動で zip した場合に発生しやすい。

### 3-3. index-\*.js / .css の累積

```
verify_zip: index-*.js 累積重複 count=3 (期待=1)
```

**対応**: 差分ビルドの残骸。クリーンビルドし直す。

```bash
rm -rf plck-main/dist
./tools/scripts/build_all.sh
```

### 3-4. 参照 JS/CSS が ZIP 内に存在しない

```
verify_zip: 参照先 assets/index-abc123.js が ZIP 内に存在しない
```

**対応**: ZIP 化の対象範囲が間違っている可能性。`dist/{unit_id}/` 配下を `cd` してから `zip` を実行しているか確認。

---

## 4. ビルド（`npx plck build`）が失敗するとき

### 4-1. 依存解決エラー

```bash
cd plck-main
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 4-2. type エラー

```bash
cd plck-main
npm run type-check
```

エラーメッセージから原因特定。`vue-tsc` のバージョン違いの場合あり。

### 4-3. メモリ不足

```bash
NODE_OPTIONS="--max-old-space-size=4096" npx plck build
```

---

## 5. 文字化け・フォント崩れ

### 5-1. 中国語が明朝化（最も多い事故）

**原因**: `tools/scripts/pptx_to_png.sh` の Meiryo→Arial 置換が中国語講座でも適用された

**対応**:

1. 元 PNG（デザイン担当出力）を `講座セットフォルダ/.../UNIT{N}/スライド{M}.png` に配置
2. `cp -p` で `plck-main/contents/scenes/slide/zh-*/slide/{M}.png` に上書き
3. preflight で SHA-256 一致を確認
4. クリーンビルドで再生成

### 5-2. ベトナム語の声調記号が分離（`á → a ´`）

**原因**: `pptx_to_png.sh` を使わずに別経路で PNG を生成した

**対応**: `pptx_to_png.sh` 経由で再生成

```bash
./tools/scripts/pptx_to_png.sh \
    "/path/to/UNIT1.pptx" \
    "/path/to/講座フォルダ/PNG/UNIT1"
```

### 5-3. 数字・英字が別フォントに化ける

**原因**: HTML 側で文字を載せている場合、フォント未指定で OS フォールバックに落ちている

**対応**: `font-family` を明示指定（[LMS_BUILD_RULES.md §5](../LMS_BUILD_RULES.md)）

---

## 6. UI 崩れ

### 6-1. ヘッダーがピンクに戻る

**原因**: 古いテンプレートが使われた

**対応**: `plck-main/core/commands/initialize/contents/frame/header/style.css` を確認。日本語版仕様（グレー #717d85、緑ボーダー #98c9b2）に統一されているか確認。

### 6-2. タイトルが 2 行になる

**原因**: 翻訳で文字数が増えた、CSS が崩れた

**対応**:

1. `plck-main/contents/frame/header/style.css` で `#scene_title br { display: none; }` が効いているか確認
2. PNG 内のタイトルが 2 行を意図したものなら、その PNG を尊重（CSS で無理に 1 行にしない）

### 6-3. ハンバーガーメニュー / 完了アイコンが表示される

**原因**: CSS の `display: none` が外れた

**対応**:

```css
#scene_menu_btn { display: none; }       /* ハンバーガー */
#scene_title .scene_title_sub { display: none; }  /* サブタイトル */
.scene_complete_icon { display: none; }  /* 完了アイコン★ */
```

---

## 7. Git / push 関連

### 7-1. push 先が個人アカウントになっている

**症状**: `git remote -v` の出力が個人の GitHub アカウントを向いている（クロスサポート以外のアカウント）

**対応**:

```bash
# リモート URL を変更
git remote set-url origin git@github.com:cross-support/plck-course-data.git

# 確認
git remote -v
```

### 7-2. gh auth が複数アカウントで混乱

```bash
# Active アカウント切替
gh auth switch -u cross-support

# 確認
gh auth status
```

### 7-3. 大きいファイルを誤ってコミットした

```bash
# 直前のコミットを取り消し（push 前のみ）
git reset HEAD~1

# .gitignore を整備してから再コミット
```

push 後の場合は git filter-repo や BFG Repo-Cleaner で履歴から削除（PM 相談）。

---

## 8. それでも解決しないとき

1. ClaudeCode に「[docs/troubleshooting.md](.) を読んで現在の症状を切り分けてください」と依頼
2. PM に Slack で報告（症状・実行コマンド・エラー出力を貼る）
3. [LMS_BUILD_RULES.md](../LMS_BUILD_RULES.md) §9 の事故記録を参照

---

_最終更新: 2026-04-30_
