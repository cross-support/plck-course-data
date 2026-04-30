# PLCK 翻訳講座ビルド標準フロー

本フォルダには、翻訳講座（中国語・ベトナム語・他言語）の LMS 用 Zip を生成するための
標準ツール・スクリプト一式を配置しています。

## 今回（2026-04-18）で永続化した前提条件

以下 3 点は**全講座に共通の永続仕様**として plck-main 側に組み込み済みです。

### 1. 高画質 PNG 仕様
- 解像度: **2668×1500 (200 DPI)** 以上
- 生成方法: `LibreOffice soffice` で PDF 変換後、`pdftoppm -r 200` で PNG 化
- 旧低画素 PNG（720×405）は**使用禁止**

### 2. 文字化け対策
- pptx 内部で使用されているフォント `Meiryo` は PNG 変換時に **`Arial`** に置換する
- ベトナム語の声調記号（á à ả ã ạ ă â ê ô ơ ư đ 等）は Arial で正常描画される
- この置換は**一時コピーに対してのみ行い、元 pptx は改変しない**
- ⚠️ **中国語 (zh-*) 講座ではこの Meiryo→Arial 置換を使用禁止**（2026-04-21 追記）
  - Arial は CJK 字形を持たず OS のフォールバック（明朝系）に落ち、
    元デザインの太字ゴシックが明朝化するなど**字形が別物の PNG** になる。
  - 中国語講座は **デザイン担当が出力した PNG をそのまま使う**（再レンダリング禁止）。
  - 詳細は `../LMS_BUILD_RULES.md` §1, §4 を参照。

### 3. ヘッダー CSS 仕様（日本語版と統一）
`plck-main/contents/frame/header/style.css` に適用済み。
`plck-main/core/commands/initialize/contents/frame/header/style.css`（テンプレート）にも同じ設定。

| 項目 | 旧 | 新（永続仕様） |
|---|---|---|
| 背景色 | `#fedcd2`（ピンク） | `#717d85`（グレー） |
| 下ボーダー | 赤 `#EE0077` 2px | 緑 `#98c9b2` 4px |
| 文字色 | `#24140e`（黒茶） | `#ffffff`（白） |
| タイトル行 | 2 行（メイン + サブ） | 1 行（メインのみ） |
| 完了アイコン（★） | 表示 | 非表示 |
| ハンバーガーメニュー | 表示 | 非表示 |

## ディレクトリ構成

```
B_2026-03-30_PLCK_data/
├── plck-main/                      ← PLCK 本体（ビルドシステム）
├── 講座セットフォルダ/              ← 講座ごとの UNIT 素材（PNG）
└── tools/                          ← 本フォルダ
    ├── README.md                   ← この文書
    └── scripts/
        ├── pptx_to_png.sh          ← pptx → 高画質PNG 変換（単体）
        └── build_unit.sh           ← pptx → PNG → plck build → Zip（一括）
```

## 標準ワークフロー

### 前提ツール
```bash
# LibreOffice（PDF 変換用）
brew install --cask libreoffice

# Poppler（pdftoppm コマンド）
brew install poppler

# ImageMagick（identify で検証）
brew install imagemagick
```

### A. 単一 UNIT を新規ビルド

```bash
cd B_2026-03-30_PLCK_data
./tools/scripts/build_unit.sh \
    zh-logistics01-unit01 \
    "/path/to/中国語 完成）〜 UNIT1.pptx" \
    "/path/to/講座フォルダ/LMS搭載用ZIP"
```

実行フロー:
1. pptx → 一時コピー → Meiryo→Arial 置換 → soffice PDF → 200 DPI PNG 生成
2. plck-main/contents/scenes/slide/{unit_id}/slide/ に `1.png..N.png` 配置
3. `plck build` 実行
4. dist/{unit_id}/ を Zip 化
5. 指定 LMS フォルダに `{unit_id}.zip`（ハイフン→アンダースコア）を配置

### B. PNG のみ再生成

```bash
./tools/scripts/pptx_to_png.sh \
    "/path/to/UNIT1.pptx" \
    "/path/to/講座フォルダ/PNG/UNIT1"
```

### C. 一括再ビルド（既存 24 UNIT）

`pptx_to_png.sh` と `build_unit.sh` を for ループで呼び出して 24 UNIT 一括実行可能。
履歴として `/tmp/plck-regen/` に 2026-04-17 の実行スクリプトあり。

## 成果物の配置ルール

講座フォルダごとに以下の構造を維持:

```
[講座フォルダ]/
├── *.pptx                          ← 元データ（不可侵）
├── PNG/
│   ├── UNIT1/slide_001.png 〜      ← 高画質 PNG（2668×1500）
│   ├── UNIT2/
│   └── UNIT3/
└── LMS搭載用ZIP/
    ├── {lang}_logistics0X_unit0Y.zip  ← LMS 搭載用
    └── 【旧・*失敗版】/                ← 旧失敗作の退避（参照用）
```

## よくある失敗と対策

| 症状 | 原因 | 対策 |
|---|---|---|
| ベトナム語声調が分離 (`kinh tế´`) | Meiryo 置換なし | `pptx_to_png.sh` を使う |
| PNG が 720×405 など低画素 | 古い変換手順 | `pdftoppm -r 200` を使う |
| soffice が PDF 出力しない | 多重起動の衝突 | `pgrep -f soffice` で待機 |
| unzip した pptx 内ファイルが 000 権限 | pptx 内部の保存形式 | `chmod -R u+rw` で修復（script 内で対応済） |
| ヘッダーがピンクに戻る | 古いテンプレートが使われた | `core/commands/initialize/contents/frame/header/style.css` を確認 |

## 変更履歴

- 2026-04-18: 初版
  - 高画質 PNG 仕様策定（2668×1500）
  - Meiryo→Arial 置換を標準化
  - ヘッダー CSS を日本語版仕様に統一
  - tools/scripts を新設
