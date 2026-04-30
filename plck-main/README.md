# PLCK

<a id="事前準備"></a>
## 事前準備

### Git

PLCKはGithubで管理されてます。ダウンロードする際などにgitを用いてこのファイルをcloneすることができます。<br />
gitの最新版をダウンロードしておいてください。

各バージョンアップの変更点などの内容についてはgitのリリースページをご確認ください。
[https://github.com/proseeds/plck/releases](https://github.com/proseeds/plck/releases)

### Node.js

PLCKを利用するには、以下のNode.jsおよびnpmのバージョンがインストールされている必要があります。

1. Node.js v16.13.0以上
2. npm v8.1.8 以上

Node.jsのインストールは以下のサイトより行ってください。（nodeをインストールすると、npmも一緒にインストールされます）
[https://nodejs.org](https://nodejs.org)

[※Dockerをご利用の場合(Dockerでの構築例)](https://github.com/proseeds/plck/wiki#docker%E3%81%A7%E3%81%AE%E7%92%B0%E5%A2%83%E6%A7%8B%E7%AF%89%E4%B8%80%E4%BE%8B)

## コンテンツ開発ドキュメント

### 開発手順

1. [PLCKコンテンツの開発環境のインストール方法](./doc/how-to-install.md)
2. [コンテンツ開発の進め方](./doc/how-to-develop.md)

### PLCK仕様

1. [ユニット](./doc/unit.md)
2. [シーンの基本](./doc/scenes/1.base.md)
   1. [video](./doc/scenes/2.video.md)
   2. [slide](./doc/scenes/3.slide.md)
   3. [quiz](./doc/scenes/4.quiz.md)
   4. [html](./doc/scenes/5.html.md)
   4. [chat](./doc/scenes/6.chat.md)
2. [フレームのカスタマイズ](./doc/frame.md)
