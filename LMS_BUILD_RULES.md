# LMS_BUILD_RULES.md

PLCK 講座（ベトナム語 / 中国語 / 日本語講座 / 他言語）を LMS（クロスラーニング LMS）へ搭載するためのビルド絶対ルール。
**新規セッションでは必ず本ファイルを冒頭で読み込むこと。**

---

## ✅ 正式ビルド手順（1本化）

**今後は次の1コマンドで事故を自動防止しつつビルドする。** 失敗時は各段階で止まる設計です。

```bash
./tools/scripts/build_all.sh
```

内部では以下の順に実行されます:
1. `preflight.sh` — 元PNG⇔plck入力PNG SHA-256照合 + 中国語禁則チェック（失敗で停止）
2. `rm -rf plck-main/dist && npx plck build` — クリーンビルド
3. 80本ZIP生成（vi/zh ロジスティクス 24本 + 日本語講座 56本。`.gitkeep`/`.DS_Store`/`__MACOSX`を除外、`zip -X` で extra attr排除）
4. `verify_zip.sh` — 全ZIPの構造と参照整合性を検証（失敗で停止）

部分実行:
```bash
./tools/scripts/preflight.sh                        # 全対象UNIT検査
./tools/scripts/preflight.sh zh-logistics01-unit01  # 単一UNITのみ
./tools/scripts/verify_zip.sh path/to/one.zip [...]  # 単体/複数ZIPの検証
```

---

## 0. この文書が生まれた背景（事故記録）

- 2026-04-21: ベトナム語・中国語ロジスティクス講座 Ⅰ〜Ⅳ を LMS に搭載した際、**中国語版スライドのフォント／字形が元デザインと違う** という崩れが発生。
- 原因は **PNG 自体のバイナリ破損ではなく**、`tools/scripts/pptx_to_png.sh` が pptx 内の `Meiryo` を `Arial` に置換してから PNG 化する副作用。
  - ベトナム語: Arial で声調記号が正しく描けるため副作用なし。
  - 中国語: Arial に CJK 字形が無く OS の CJK フォールバック（明朝系）に落ち、**元デザインと字形が別物の PNG** が `plck-main` に取り込まれた。
- さらに `plck-main/contents/scenes/slide/{unit_id}/slide/` 配下の PNG が「更新前の古い版」で固定され、講座セットフォルダ側の最新 PNG と同期されていなかった。

---

## 1. LMS 搭載用 ZIP 作成時の絶対ルール

1. **`plck-main/contents/scenes/slide/{unit_id}/slide/` の PNG は必ず `講座セットフォルダ/{言語}_{講座名}/UNIT{N}/スライド{M}.png` と SHA-256 完全一致** にする。
2. **中国語（zh-*）講座では `tools/scripts/pptx_to_png.sh` / `build_unit.sh` の Meiryo→Arial 置換フローを使ってはいけない。**
   - pptx からの再レンダリングは PowerPoint または LibreOffice で**フォント置換なしの状態**で行い、生成した PNG をそのまま利用する。
   - 中国語では Arial 置換の副作用で CJK 字形が別フォントへフォールバックし、デザイン改変になる。
3. **ZIP ルート直下に `index.html`・`favicon.ico`・`assets/`・`img/` が並ぶ形にする**（1 階層深いラップは禁止）。
4. **ZIP 化は `dist/{unit_id}` 配下を `cd` してから `zip -rqX ZIP名 . -x "*.DS_Store" ".gitkeep" "img/.gitkeep" "__MACOSX/*"`** で行う（macOS メタ・空 placeholder を除外）。
5. **ZIP 作成前に必ず `rm -rf dist && npx plck build` を実行**（差分ビルドで古い `index-*.js` / `index-*.css` が累積するため。累積すると 1 ZIP あたり 4〜8MB のゴミが同梱される）。
6. ZIP ファイル名は `{prefix}_{unit}.zip`（ハイフンはアンダースコアに変換）。例: `zh_logistics01_unit01.zip`。
7. 配置先は必ず `講座セットフォルダ/{言語}_{講座名}/LMS搭載用ZIP/`。

---

## 2. 元 PNG と ビルド成果物の差分確認手順（必須）

ビルド後 ZIP 作成前に、以下を必ず通す。

```bash
# 例: 中国語Ⅰ UNIT1 で抜き取りチェック
SRC="$BASE/講座セットフォルダ/中国語_よくわかる！ロジスティクス入門Ⅰ/UNIT1"
DIST="$BASE/plck-main/dist/zh-logistics01-unit01/assets"
for i in 1 5 10 15 20; do
  S=$(shasum -a 256 "$SRC/スライド${i}.png" | awk '{print $1}')
  D=$(shasum -a 256 "$(ls $DIST/${i}-*.png)" | awk '{print $1}')
  [ "$S" = "$D" ] && echo "OK $i" || echo "MISMATCH $i"
done
```

**1 件でも MISMATCH が出たら ZIP 化してはいけない。** plck-main 側の `contents/scenes/slide/{unit_id}/slide/{N}.png` を元 PNG で上書きし直してから再ビルド。

---

## 3. 文字化け・フォント崩れ・書式崩れのチェック項目

ZIP 化前に、対象 UNIT の任意のスライド（タイトル有り / 本文有り）について次を目視で確認する。

- [ ] タイトルのフォントウェイト（太字感）が元と同じか
- [ ] 本文のフォント種類（ゴシック / 明朝）が元と同じか
- [ ] 句読点・記号（、。，．？！）の字形が元と同じか
- [ ] 中国語: 簡体字の各字形（「经」「务」「发」など）が明朝化していないか
- [ ] ベトナム語: 声調記号（á à ả ã ạ ă â ê ô ơ ư đ）が文字と分離していないか
- [ ] 数字・英字の字形が元と同じか
- [ ] タイトルが 2 行折り返しに変化していないか

**比較は「元 PNG（講座セットフォルダ）」⇔「dist 内 PNG」⇔「LMS 表示結果」の 3 段で実施する。**

---

## 4. 言語別ビルドルール表

| 言語 | prefix | フォント置換(Meiryo→Arial) | pptx → PNG 再レンダリング | 推奨 PNG 入手手段 | よくある崩れ | 主な対策 |
|---|---|---|---|---|---|---|
| 日本語 | ja-* / privacy-* / security-* | 許可（日本語は Meiryo / Yu Gothic 等が豊富） | 許可（既存 privacy/security 実績フロー） | pptx → 200DPI PNG 変換 | 行間・半角英数のカーニング差 | `pdftoppm -r 200` を固定 |
| ベトナム語 | vi-* | **許可**（Arial が声調記号を含む） | 許可 | pptx → 200DPI PNG + Meiryo→Arial 置換 | 声調記号の分離 (`kinh tế´`) | `tools/scripts/pptx_to_png.sh` を使用（Arial 置換込み） |
| 中国語 | zh-* | **禁止** 🚫 Arial に CJK 字形なし→ 明朝系フォールバックで字形劣化 | **原則禁止**（やむを得ない場合は Noto Sans SC / Microsoft YaHei を明示指定） | **デザイン担当が出力した元 PNG をそのまま使用** | 本文の明朝化・太字消失・句読点位置ズレ | `plck-main` 入力は元 PNG とハッシュ一致必須。`preflight.sh` で検出 |
| 韓国語 | ko-*（今後） | 未検証。Arial に Hangul 字形なし → 中国語と同類の注意 | 検証前は禁止 | 中国語と同様にデザイン出力を直接使用推奨 | 同上 | 事前に `preflight.sh` に ko-* 検査を追加 |
| タガログ語 | tl-*（今後） | ベトナム語に近い（ラテン拡張）。要検証 | 検証後に許可 | pptx → PNG 変換で検証 | 鼻音記号 `ñ`・アクセント `á` の分離 | 実装時に QA 必須 |
| その他 | * | 禁止（個別検証・承認後に表へ追加） | 禁止 | デザイン出力を直接使用 | 未知 | 追加時は本表を更新 |

中国語講座の PNG 生成では **元デザインの PowerPoint のフォント埋め込み** をそのまま活かす。環境に該当フォントが無い場合は、**デザイン担当者側で PNG をエクスポートしたファイルを受領**し、プログラム側では再レンダリングしないこと。

---

## 4-A. LMS 搭載前 目視確認必須チェックポイント

次のスライドは **最低限すべて目視で確認する**（dist 側か `npx plck start {unit}` で）。

| # | 対象 | なぜ見るか | 見るべき観点 |
|---|---|---|---|
| 1 | 各講座 **UNIT1 の 1 枚目** | タイトルフォント・冒頭表紙。第一印象の事故が起きやすい | タイトル太さ・字形・改行位置・ヘッダー重畳 |
| 2 | 中国語講座すべての **タイトル帯スライド**（ハイライトあり） | zh-* で最も崩れやすい部位 | ゴシック／明朝のフォント切り替わりが無いか |
| 3 | 中国語講座の **長文帯スライド**（複数行本文） | 明朝化・字間ズレが起きやすい | 本文が細字・明朝に化けていないか |
| 4 | ベトナム語講座の **声調記号を多く含むスライド** | Arial 置換の副作用 | 記号が文字から分離していないか (`á` が `a ´` に見えないか) |
| 5 | **数字・英字・記号を含むスライド** | ラテン系フォールバックで別フォントに化ける | 桁区切り・%・単位表記が崩れていないか |
| 6 | **最終スライド（完了画面）** | LMS 完了フラグ送信直前 | 完了アイコン★非表示・ハンバーガー非表示・ヘッダーグレー |
| 7 | 任意の **画像 + 文字組み合わせスライド** | レイアウト崩れ | 文字が画像に被っていないか・空白量の差異 |

**目視確認は「元 PNG」と「dist PNG」の 2 枚並べで行う**（`open src.png dist.png` で並べる or macOS のプレビューの 2 画面）。違いがあれば LMS 搭載前に修正する。

---

## 5. タイトル・サブタイトルを HTML 側で再描画しない（再描画する場合の厳格ルール）

- PLCK のヘッダー CSS（`plck-main/contents/frame/header/style.css`）では:
  - `#scene_title .scene_title_sub { display: none; }` でサブタイトル重複描画を無効化
  - `#scene_title br { display: none; }` で強制改行を無効化
  - `#scene_menu_btn { display: none; }` でハンバーガー非表示
- HTML 側で文字を載せたい場合は:
  - 元 PNG に焼き込まれている文言と**絶対に重複させない**
  - 中国語フォントは `font-family: "Microsoft YaHei", "PingFang SC", system-ui, sans-serif;` のように**明示指定**する。未指定は禁止（環境により Arial / Times 等に落ちる）
  - Web フォント使用時は **CSS の @font-face が ZIP 内から解決できる相対パス** にする（LMS ドメインから外部 CDN 取得が遮断される構成があるため）

---

## 6. ZIP 化前の検証手順（必須）

1. `rm -rf plck-main/dist && cd plck-main && npx plck build` を実行（完全クリーンビルド）
2. `plck-main/contents/scenes/slide/{unit_id}/slide/*.png` と `講座セットフォルダ/.../UNIT{N}/スライド*.png` の SHA-256 全件一致を確認
3. `dist/{unit_id}/assets/{N}-*.png` と元 PNG の SHA-256 抜き取り一致を確認（2 で一致していればここも自動一致）
4. `dist/{unit_id}/index.html` の `src="./assets/index-*.js"` / `href="./assets/index-*.css"` の **ハッシュ付きファイル名が `dist/{unit_id}/assets/` に実在する** ことを確認
5. `dist/{unit_id}/` 直下に不要な重複 `index-*.js` / `index-*.css` が無い（各 1 個ずつのみ）ことを確認

---

## 7. ZIP 化後の検証手順（必須）

```bash
ZIP="..."  # 対象 ZIP
# 7-1. ルート直下に index.html があるか
unzip -l "$ZIP" | grep -E "^\s+\d+\s+[0-9-]+ [0-9:]+\s+index\.html$"
# 7-2. macOS メタが無いか
unzip -l "$ZIP" | grep -E "__MACOSX|DS_Store|/\._" && echo NG || echo CLEAN
# 7-3. index.html 参照ファイルが ZIP 内に存在するか
unzip -p "$ZIP" index.html | grep -oE 'assets/index-[a-z0-9]+\.(js|css)' | while read ref; do
  unzip -l "$ZIP" | grep -q "$ref" && echo "OK $ref" || echo "MISSING $ref"
done
# 7-4. 古い index-*.js / css が混入していないか（各 1 個のみが正常）
echo "js count: $(unzip -l "$ZIP" | grep -cE 'assets/index-.*\.js$')"   # 期待値: 1
echo "css count: $(unzip -l "$ZIP" | grep -cE 'assets/index-.*\.css$')" # 期待値: 1
```

---

## 8. LMS 搭載前に必須の目視確認項目

1. 代表スライド 1 枚（タイトル入り）を dist 側から開き、元 PNG とピクセル差分がほぼ 0 であること（`compare` などで可）
2. ローカルで `npx plck start {unit_id}` を実行し、`http://localhost:8000/` で:
   - ヘッダーがグレー (#717d85)・下ボーダー緑 (#98c9b2)・タイトル 1 行
   - ハンバーガーメニュー非表示
   - 完了アイコン（★）非表示
   - スライド切替時にテキスト崩れ・文字化けが発生しないこと
3. 複数ブラウザ（Chrome / Safari）で描画差が無いこと

---

## 9. 問題があった場合の切り分け手順（工程単位）

発生時、以下を **上から順に** 確認する。上流で差分があれば、それより下流は見なくてよい。

| # | 工程 | 確認方法 | 差分があった時の対応 |
|---|---|---|---|
| 1 | 元 PNG（講座セットフォルダ／スライド*.png） | PowerPoint で pptx を開き直接比較、または元デザインと目視比較 | デザイン担当に差し戻し |
| 2 | plck-main 入力（contents/scenes/slide/{unit}/slide/{N}.png） | `shasum -a 256` で 1 と比較 | 1 から上書きコピー → 3 以降再実行 |
| 3 | dist 出力（dist/{unit}/assets/{N}-*.png） | `shasum -a 256` で 2 と比較 | `rm -rf dist && npx plck build` |
| 4 | ZIP 内 PNG | `unzip -p ZIP assets/{N}-*.png | shasum -a 256` | ZIP 再作成（§1 ルール遵守） |
| 5 | LMS 表示 | ブラウザで実表示を目視 | 4 まで正常なら LMS 側（CSS 注入・フォント差替・重畳レイヤ）を疑う |

**「PNG 破損」か「HTML/CSS/JS/LMS の重畳」かの切り分け最短手順:**
- 1 ⇔ 2 のハッシュが不一致 → PNG 段階の問題（本件がこれ）
- 1 ⇔ 4 まで一致し 5 でのみ崩れる → HTML/CSS/JS または LMS 側で別描画している可能性

---

## 10. 画像変換工程の禁則

- PLCK のビルド（`vite`）は PNG を **再エンコードしない**（ハッシュ付きリネームのみ）。本件確認済み。
- したがって「画像最適化」「WebP 変換」「圧縮」などを途中に挟まない。
- 画像差し替えは **必ず元 PNG のバイト列をそのままコピー** する。

---

## 11. 永続参照のための配置

- 本ファイル (`LMS_BUILD_RULES.md`) はリポジトリルート配下に置く。
- `CLAUDE.md` に本ファイルへのリンクを記載し、新規 Claude Code セッション開始時に自動読込されるようにする。
- `tools/README.md` の「Meiryo→Arial 置換」の記述には **中国語では禁止** 旨を追記する。

---

## 12. 自動化スクリプト一覧（`tools/scripts/` 配下）

| スクリプト | 役割 | 停止条件 |
|---|---|---|
| `build_all.sh` | 正式なビルド入口（preflight→build→zip→verify を一本化） | 任意の段階の失敗で全体停止 |
| `preflight.sh` | 元PNG ⇔ plck入力PNG の SHA-256 照合、中国語禁則（pptx混入）検出、枚数整合 | ハッシュ不一致・枚数差・pptx混入のいずれかで非ゼロ終了 |
| `verify_zip.sh` | ZIPルート直下 `index.html`/`favicon.ico`/`assets/` の存在、`index.html` 参照 JS/CSS の実在、累積重複 0 件、macOSメタ無混入 | 上記いずれか違反で非ゼロ終了 |
| `pptx_to_png.sh` | （**vi-\*/ja-\* 専用**）pptx → 200DPI PNG + Meiryo→Arial 置換 | **zh-\* では使用禁止** |
| `build_unit.sh` | （vi-\*/ja-\* 専用）単一UNITを pptx から通しビルド | **zh-\* では使用禁止** |
| `cleanup.sh` | 既存ユーティリティ（dist残骸整理など） | — |

`build_all.sh` の `PAIRS` と `JP_UNITS` が、現時点の一括生成対象 80本の正本リストです。Claude Code から実行する場合も、プロジェクトルートで `./tools/scripts/build_all.sh` を実行してください。LMS 搭載時は `xxx 2.zip` / `xxx 3.zip` などスペース付きの過去版 ZIP ではなく、スペースなしの正本 ZIP を使います。

### 停止ポイント一覧
| 段階 | 停止理由の例 | エラー出力例 |
|---|---|---|
| preflight | 元PNG と plck入力PNG の SHA-256 不一致 | `PNG SHA-256 不一致 slide=N src=xxx plck=yyy` |
| preflight | 中国語UNITに pptx/pdf が混入 | `中国語ユニットに pptx/pdf が混入 ... 禁止` |
| preflight | 枚数不一致 | `枚数不一致 src=N plck=M` |
| build | `npx plck build` 自体の失敗 | vite/rollup のビルドエラー |
| zip | `dist/{unit}` が不存在 | `dist 生成物が無い: ...` |
| verify_zip | index.html がルートに無い（1階層深い） | `ルート直下に index.html が無い` |
| verify_zip | index.html 参照 JS/CSS が ZIP 内に存在しない | `参照先 assets/index-xxx.js が ZIP 内に存在しない` |
| verify_zip | 累積残骸 | `index-*.js 累積重複 count=N (期待=1)` |
| verify_zip | macOSメタ混入 | `macOS メタファイルが混入` |

---

_最終更新: 2026-05-25（iframe 初回表示崩れ対策と 80本一括生成ルールへ更新）_
