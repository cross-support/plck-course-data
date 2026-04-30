# docs/folder-structure.md — フォルダ配置ルール

このリポジトリのフォルダ配置と各フォルダの役割を定義します。

---

## 1. ルート構成

```
plck-course-data/                       # ローカルでは B_2026-03-30_PLCK_data の場合あり
├── README.md                           # 入口ドキュメント
├── CLAUDE.md                           # ClaudeCode 用作業ルール
├── LMS_BUILD_RULES.md                  # LMS 搭載 ZIP 絶対ルール（最優先）
├── SETUP.md                            # 初回セットアップ手順
├── SKILLS.md                           # 必要スキル一覧
├── RULES.md                            # 運用ルール
├── CHANGELOG.md                        # 変更履歴
├── .env.example                        # 環境変数テンプレート
├── .gitignore                          # Git 除外設定
│
├── docs/                               # 補足ドキュメント
│   ├── folder-structure.md             # このファイル
│   ├── build-flow.md
│   ├── lms-zip-flow.md
│   ├── translation-rules.md
│   ├── tag-rules.md
│   └── troubleshooting.md
│
├── scripts/                            # リポジトリ層のスクリプト（薄いラッパー中心）
│   ├── setup.sh                        # 初回セットアップ
│   └── preflight.sh                    # tools/scripts/preflight.sh のラッパー
│
├── tools/                              # 制作・ビルドツール本体
│   ├── README.md                       # 翻訳講座ビルド標準フロー
│   └── scripts/
│       ├── build_all.sh                # 正式ビルド入口（preflight→build→zip→verify）
│       ├── preflight.sh                # 元PNG⇔plck入力PNG SHA-256 照合
│       ├── verify_zip.sh               # ZIP 内構造・参照整合性検証
│       ├── pptx_to_png.sh              # PPTX→PNG（vi-*/ja-* 専用）
│       ├── build_unit.sh               # 単一 UNIT ビルド（vi-*/ja-* 専用）
│       └── cleanup.sh                  # 残骸整理
│
├── plck-main/                          # PLCK 本体（ビルドシステム）
│   ├── README.md
│   ├── package.json
│   ├── contents/                       # スライド素材投入先
│   │   └── scenes/slide/{unit_id}/slide/{N}.png  # ★ビルド入力 PNG
│   ├── core/                           # plck の中核
│   ├── doc/
│   ├── node_modules/                   # ★Git 管理対象外
│   └── dist/                           # ★Git 管理対象外（ビルド成果物）
│
└── 講座セットフォルダ/                # ★Git 管理対象外（Google Drive で別管理）
    ├── ベトナム語_よくわかる！ロジスティクス入門Ⅰ/
    │   ├── *.pptx                      # 元データ（不可侵）
    │   ├── UNIT1/
    │   │   └── スライド{N}.png         # 元 PNG（高画質 200 DPI）
    │   ├── UNIT2/
    │   ├── UNIT3/
    │   └── LMS搭載用ZIP/
    │       ├── vi_logistics01_unit01.zip
    │       ├── vi_logistics01_unit02.zip
    │       ├── vi_logistics01_unit03.zip
    │       └── 【旧・*失敗版】/        # 過去の失敗作の退避場所
    ├── ...（他言語・他講座が同様）
    ├── 個人情報の取扱/
    └── 情報セキュリティ/
```

---

## 2. Git 管理対象 / 対象外

### 管理対象（リポジトリに含まれる）

- ドキュメント類（`*.md`、`docs/`）
- スクリプト類（`scripts/`、`tools/scripts/`）
- `plck-main/` のソースコード（`contents/`、`core/`、設定ファイル）
- `tools/README.md`、`plck-main/README.md`

### 管理対象外（`.gitignore` で除外）

| 対象 | 理由 |
|---|---|
| `node_modules/` | 巨大・再生成可能 |
| `plck-main/dist/` | ビルド成果物・再生成可能 |
| `講座セットフォルダ/` | 巨大バイナリ（700MB+）。Google Drive で別管理 |
| `*.zip`（特に LMS 搭載用） | 再生成可能。容量問題 |
| `*.pptx` / `*.pdf` | 巨大バイナリ・元データは別管理 |
| `plck-main/contents/scenes/slide/*/slide/*.png` | ビルド入力 PNG（講座素材の派生） |
| `.env` / 認証情報 | セキュリティ |
| `.DS_Store` / OS メタ | 不要 |
| `tmp/` / `failed/` / `archive/failed/` | 一時ファイル・失敗作 |

> 実際の除外設定は [.gitignore](../.gitignore) を参照。

---

## 3. 重要ファイルの SHA-256 連鎖

LMS 搭載用 ZIP の完全性は次の連鎖で保たれます。すべての段階で一致が必須:

```
[① 講座セットフォルダ/.../UNIT{N}/スライド{M}.png]
                      ↓ shasum -a 256 で一致
[② plck-main/contents/scenes/slide/{unit_id}/slide/{M}.png]
                      ↓ npx plck build （ハッシュ付きリネームのみ）
[③ plck-main/dist/{unit_id}/assets/{M}-*.png]
                      ↓ zip -rqX
[④ {unit_id}.zip 内の assets/{M}-*.png]
                      ↓ LMS が解凍して表示
[⑤ ブラウザ実機での表示]
```

`./tools/scripts/preflight.sh` は ① ⇔ ② を全件検査し、`./tools/scripts/verify_zip.sh` は ④ の整合性を検査します。

---

## 4. 講座フォルダ → unit_id マッピング

| 講座フォルダ名 | plck unit_id prefix |
|---|---|
| ベトナム語_よくわかる！ロジスティクス入門Ⅰ | `vi-logistics01` |
| ベトナム語_よくわかる！ロジスティクス入門Ⅱ | `vi-logistics02` |
| ベトナム語_よくわかる！ロジスティクス入門Ⅲ | `vi-logistics03` |
| ベトナム語_よくわかる！ロジスティクス入門Ⅳ | `vi-logistics04` |
| 中国語_よくわかる！ロジスティクス入門Ⅰ | `zh-logistics01` |
| 中国語_よくわかる！ロジスティクス入門Ⅱ | `zh-logistics02` |
| 中国語_よくわかる！ロジスティクス入門Ⅲ | `zh-logistics03` |
| 中国語_よくわかる！ロジスティクス入門Ⅳ | `zh-logistics04` |
| 個人情報の取扱 | `privacy-*`（搭載済み） |
| 情報セキュリティ | `security-*`（搭載済み） |

各 UNIT は `{prefix}-unit0{1,2,3}`、ZIP 名は `{prefix//-/_}_unit0{N}.zip`。

---

## 5. 講座素材の取得・配置

このリポジトリには `講座セットフォルダ/` の中身は含まれません。
clone した直後に作業を始める場合は:

1. Google Drive `共有ドライブ > クロスラーニング` から該当フォルダをダウンロード
2. リポジトリ直下に `講座セットフォルダ/` という名前で配置
3. `bash scripts/preflight.sh` で配置確認

> 共有 URL は機密のため、PM に問い合わせてください。

---

_最終更新: 2026-04-30_
