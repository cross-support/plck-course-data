# コンテンツ開発の進め方

PLCKを使って各シーンを用意したり、ページを構成したりするコンテンツ開発の進め方について解説いたします。<br />
コンテンツ開発は主に以下のような流れで開発します。

1. コンテンツ開発環境を準備する
1. コンテンツディレクトリを作成する
1. ユニットを追加する 
1. ユニット開発用のローカルサーバーを立ち上げる（ローカルサーバーを停止する）
1. 講座で使用するシーンを用意する
1. シーンの設定やコンテンツの内容を準備する
1. 作成したシーンをフレームに設定する
1. ローカルサーバーで作成したコンテンツを確認する
1. フレームをカスタマイズする
1. 開発したコンテンツをビルドし、公開用のファイルを作成する

まずはこちらの[事前準備](../README.md#事前準備)の内容を確認し、開発に必要となるツールをインストールしてください。

## 1. コンテンツ開発環境を準備する

コンテンツの開発環境を準備します。<br />

### Githubからファイルをダウンロードする

まずは、この開発環境をgitからダウンロードします。<br />
ダウンロード方法はいくつかあります。

#### Githubのダウンロードボタンからダウンロードする

https://github.com/proseeds/plck のページのCodeボタンから Download ZIP を選択し、Zipファイルをダウンロードすることができます。

#### gitコマンドを使ってcloneする

gitコマンドを使用してファイルをcloneすることができます。<br />
コマンドラインを開き、plckを配置したい任意のフォルダに移動します。

**Windows**
```shell
# PLCKを配置したいフォルダにcdを使って移動
$ cd path\to\directory
```

**Mac/Linux**
```shell
# PLCKを配置したいフォルダにcdを使って移動
$ cd path/to/directory
```

移動したら、以下のgitコマンドを実行します。<br />

**注意:** gitコマンドはgitをインストールしなければ使用することができません。あらかじめ最新のgitをインストールしておいてください。
[Git](https://git-scm.com/)

**Windows/Mac/Linux**
```shell
$ git clone https://github.com/proseeds/plck
```

### 開発環境をインストールする 

開発環境のインストール方法は、[こちら](./1-how-to-insatall.md)で解説しています。


## 2. コンテンツディレクトリを作成する

開発環境のインストールが完了したら、コンテンツ開発用のディレクトリを作成します。
コンテンツ開発用のディレクトリは、コマンドラインを実行することでサンプルシーンとユニットを含んだ初期フォルダを簡単に作成することができます。
以下のコマンドラインを実行します。

**注意:** npm コマンドを実行する際にはかならずplckのフォルダ内（package.jsonがあるフォルダ内）に移動して実行してください。

**Windows/Mac/Linux**
```shell:Windows/Mac/Linux
$ npm run init
```

このコマンドラインを実行すると、フォルダのトップディレクトリに `contents` ディレクトリが作成されます。

`contents` ディレクトリは以下のフォルダで構成されます。

<pre>
┣ contents
  ┣ scenes ・・・・ シーンの定義ファイルを管理するフォルダです
  ┣ frames ・・・・ ヘッダーやポップアップなど、フレーム全体に影響するスタイルや機能を定義するフォルダです
  ┣ units  ・・・・ ユニットごとの設定ファイルを管理するフォルダです
</pre>

PLCKでは、ユニット単位でシーンを定義し、複数の講座を作成できます。<br />
そのため、まずはユニット（講座）を作成し、それに対応するシーンを作成するというながれで制作を行っていきます。


#### 作成されたサンプルファイルについて

作成されたサンプルファイルを編集し、そのまま講座開発を進められます。<br />
ユニット名およびシーン名は各フォルダの名前を用いしていますので、それを講座の任意の名前に変更することで使用することも可能です。


<pre>
┣ contents
  ┣ scenes
     ┣ video
     ┃　　┣ video-sample ## このフォルダ名を作成する講座の任意の名前にリネームして使用することも可能です。
     ...
  ┣ frames
  ┣ units
      ┣ unit-sample ## このフォルダ名を作成する講座の任意の名前にリネームして使用することも可能です。
</pre>

**リネーム後**

<pre>
┣ contents
  ┣ scenes
     ┣ video
     ┃　　┣ my-video
     ...
  ┣ frames
  ┣ units
      ┣ my-unit-01
</pre>

**/units/my-unit-01/plck.config.yaml**

リネームしたシーンを使うようにyamlの設定を変更する。

```yaml
title: テストタイトル<small>タグで囲われている更新されるかテスト</small>
default_lang: ja
display_complete_alert: off
complete_flg_scene:
scene_menu: on
multi_lang: on
popup_explanation_text: このユニットは終了です。お疲れ様でした
popup_next_unit_text: 次のユニットへ
popup_close_text: 終了する
label_text: 言語を選択してください
lang:
  - ja
  - en
frames:
  - main:
      name: my-video # リネームしたフレームを読み込む
      type: video
```

**リネーム後のユニットを立ち上げる**
```shell
$ npm run start my-unit-01
```

新しくユニットやシーンを作成したい場合は、後述の手順で作成が可能です。


## 3. ユニットを作成する

`npm run init` を実行すると、サンプル用の初期ファイルとして `units`ディレクトリに `unit-sample` が設置されています。<br />
他の講座を（ユニット）を作成したい場合は、`npm run add-unit` コマンドを実行することで新しい unit フォルダを作成することができます。

**Windows/Mac/Linux**
```shell:Windows/Mac/Linux
$ npm run add-unit test-sample
```

コマンドを実行すると、プロンプトが実行され、以下の項目について入力を求められます

1. ユニットのタイトル
2. ユニットの言語
3. ユニットの翻訳言語

実行が完了すると、 `units` ディレクトリに `test-sample` フォルダが生成されます。


### 3-1. plck.config.yamlを確認する

作成した `contents` の `units/unit-sample` ディレクトリにの中に  `plck.config.yaml` ファイルが設置されています。このyamlファイルには、このユニットの設定を定義することができます。

### yamlとは?

yamlとは、jsonなどのような構造的なデータオブジェクトを簡単な文字列で定義することができる言語です。`json`よりも制約が少なく、かなり記述がしやすくなっています。<br />PLCKではこのyaml形式のファイルを用いて設定ファイルを定義します。<br />
yamlの記法については以下をご参照ください。

[https://yaml.org/](https://yaml.org/)

```yaml
title: 講義のタイトルを入力します 
scene_menu: on
complete_flg_scene: 1
display_complete_alert: off
popup_explanation_text: このユニットは終了です。お疲れ様でした
popup_next_unit_text: 次のユニットへ
popup_close_text: 終了する
multi_lang: on
default_lang: ja
label_text: Choose your language
lang:
  - ja
  - en
frames:
```

ユニットの詳細や、`plck.config.yaml` については、以下の内容をご確認ください。

[ユニット](./unit.md)


## 4. 開発用のローカルサーバーを立ち上げる（ローカルサーバーを停止する）

開発環境のインストールが完了したら、以下のコマンドを使って開発環境を立ち上げます。
開発環境を立ち上げる場合は、立ち上げたいユニットのディレクトリの名前を指定する必要があります。
`npm run init` を使って作成した `contents` ディレクトリには、 `units` ディレクトリに `sample-unit` が含まれています。
`sample-unit` を立ち上げる場合は以下のようにコマンドを実行します。

**注意:** npm コマンドを実行する際にはかならずplckのフォルダ内（package.jsonがあるフォルダ内）に移動して実行してください。

**Windows/Mac/Linux**
```shell:Windows/Mac/Linux
$ npm run start unit-sample
```

しばらく経って以下が画面に表示されたらローカルサーバーが立ち上がった合図となります。

```shell:Windwos/Mac/Linux
  VITE v4.3.9  ready in 620 ms

  ➜  Local:   http://localhost:8000/
  ➜  Network: http://172.23.37.212:8000/
  ➜  Network: http://172.18.0.1:8000/
  ➜  Inspect: http://localhost:8000/__inspect/
  ➜  press h to show help
```

この状態でLocalに書かれているURL（例ではhttps://localhost:8000/）にブラウザでアクセスするとPLCKの開発画面が表示されます。


## 5. 講座で使用するシーンを用意する

### シーンの種類

シーンは以下の種類があります。

| シーン名 | 概要 |
|------|----|
| video   | ビデオを表示することができるシーン |
| quiz   | クイズ形式のシーン |
| slide   | スライド形式のシーン |
| html   | HTMLを使用できる自由度の高いシーン |
| chat   | HTMLに加え、チャット形式のコンポーネントを使用できる自由度の高いシーン |


講座で使用する各シーンは、`contents/scenes`ディレクトリに設置していきます。
ディレクトリの構造は以下のようになります。

<pre>
┣ contents
  ┣ scenes
  ┃   ┣ html
  ┃   ┃  ┣ ...
  ┃   ┣ video
  ┃   ┃  ┣ ...
  ┃   ┣ chat
  ┃   ┃  ┣ ...
  ┃   ┣ quiz
  ┃   ┃  ┣ ...
  ┃   ┣ slide
  ┃   ┃  ┣ ...
</pre>

各ディレクトリにそれぞれのシーンに必要なファイルを用意します。

### コマンドラインツールを使ったシーンの作成

PLCKには、各シーンの雛形となるファイルを準備するためのコマンドが用意されています。

以下のコマンドを実行します。

**Windows/Mac/Linux**
```shell:Windows/Mac/Linux
npm run add video video-scene1
```

このコマンドを実行すると、`scenes/video` ディレクトリに `video-scene1` という名前のディレクトリが作成され、ビデオのシーンを作成するのに必要なファイル群が生成されます。

`npm run add` コマンドの使い方は以下の通りです。

`npm run add <シーンの種類> <シーンの名前> <ユニットの名前>`

| プロパティ   | 概要                                                                                                                               |
|---------|----------------------------------------------------------------------------------------------------------------------------------|
| シーンの種類  | video/quiz/slide/chat/html のいずれかを入力します                                                                                           |
| シーンの名前  | 任意のシーンの名前（英数字および-と_が使用可能）を設定します                                                                                                  |
| ユニットの名前 | すでに作成しているユニットの名前を指定できます。ユニット名を指定することで、そのユニットで定義されている `lang` の翻訳ファイルも同時に作成します。<br />省略することもでき、指定しない場合は、名前順で一番最初になるユニットが自動的に選択されます |


## 4. シーンの設定やコンテンツの内容を準備する

シーンファイルをコマンドツールを用いて作成したら、各シーンごとの内容を記述していきます。

基本的に各シーンは、以下のファイル群を用いてコンテンツの内容を設定することができます。

| ファイル名 | 概要 | ファイルが生成されるシーン |
|------|----|----|
| config.*.yaml | シーンの設定を記述する基本となるファイルです。 * は ja や en などの言語のロケール文字列となり、設定されている各言語ごとの設定が必要です。 | 全てのシーン |
| customHook.js | シーンに設定したい追加のスクリプトを記述することができます。シーンごとに設定されているイベントに応じて処理を記述することができます | 全てのシーン |
| style.css   | シーンのスタイルを変更することができます。作成したばかりの時は、デフォルトのスタイルが設定されています。 | video / quiz / slide |
| html.vue | シーンのコンテンツのHTMLを記述することができます。 | html / chat |

上記のように、各シーンごとに必要なファイルが生成され、シーンを構成します。


各シーンの設定方法については以下からご確認ください。

1. [sceneファイルの基本](./scenes/1.base.md)
1. [video](./scenes/2.video.md)
1. [slide](./scenes/3.slide.md)
1. [quiz](./scenes/4.quiz.md)
1. [html](./scenes/5.html.md)
1. [chat](./scenes/6.chat.md)

たとえば、 `video` のシーンの `config.*.yaml` は以下のプロパティーがあります。

```yaml
title: 動画のタイトルが入ります。
video_url: video.com
complete_end_video: on
btn_next_scene_name: 次へ
btn_next_unit_name: 次のユニットへ
btn_end_unit_name: 終了する
```

`video_url` にビデオのURLを指定します。

**注意**: `video_url` は `p-movie` のURLのみが利用可能です。

```yaml
title: 動画のタイトルが入ります。
video_url: https://p-movie.biz/player/sco1_pc/k/some_video_url
complete_end_video: on
btn_next_scene_name: 次へ
btn_next_unit_name: 次のユニットへ
btn_end_unit_name: 終了する
```

ほとんどの要素は、 `config.yaml` に設定として記述することで定義することができます。

## 5. 作成したシーンをフレームに設定する

作成したシーンを画面に表示するため、 `plck.config.yaml` に記述を追記します。

```yaml
title: 講義のタイトルを入力します 
scene_menu: on
complete_flg_scene: 1
display_complete_alert: off
popup_explanation_text: このユニットは終了です。お疲れ様でした
popup_next_unit_text: 次のユニットへ
popup_close_text: 終了する
multi_lang: on
default_lang: ja
label_text: Choose your language
lang:
  - ja
  - en
frames:
# 作成した video-scene1を追加
+  - main:
+      name: video-scene1
+      type: video
```

`frames` プロパティーに **配列形式** で作成したシーンを設定していきます。<br />
`name` には先ほど作成した時に命名したシーンの名前( `video-scene1` )を指定し、`type` にシーンの種類として `type` を指定します。

フレームには、最大2つのシーンを組み合わせることができます。<br />
その場合は、以下のように `sub` プロパティーをつかして組み合わせしたいシーンを指定する必要があります。

```yaml
title: 講義のタイトルを入力します 
scene_menu: on
complete_flg_scene: 1
display_complete_alert: off
popup_explanation_text: このユニットは終了です。お疲れ様でした
popup_next_unit_text: 次のユニットへ
popup_close_text: 終了する
multi_lang: on
default_lang: ja
label_text: Choose your language
lang:
  - ja
  - en
frames:
  - main:
      name: video-scene1
      type: video
# subシーンを追加して一つのフレームに2つのシーンを表示する 
+    sub:
+      name: quiz-scene2
+      type: quiz
```

## 6. ローカルサーバーで作成したコンテンツを確認する

シーンの設定が完了したら、立ち上げているローカルサーバーの画面を確認するとフレームに設定したシーンが表示されます。

画面の更新はシーンの設定変更を検知し自動で行われます。<br />
変更のたびに画面を更新したローカルサーバーを立ち上げ直したりする必要はありません。

**注意:** 変更内容によっては、この更新が止まってしまう場合もありますので、その際には Ctrl+Q を押してローカルサーバーを停止して再度 `npm run start <ユニットの名前>` を実行してください。

## 7. 開発したコンテンツをビルドし、公開用のファイルを作成する

開発が完了したら、開発したファイルから公開用のファイルをビルドする必要があります。<br />
実際にLMSにアップロードするのはビルドされたファイルをアップロードする必要があります。

ビルドは以下のコマンドを実行します。

**Windows/Mac/Linux**
```shell:Windows/Mac/Linux
npm run build
```

ビルドが完了すると、PLCKのディレクトリ内に `dist` ディレクトリが作成されます。<br />
LMSにアップロードするのはこの `dist` ディレクトリなので、フォルダ名を変更したりzipで圧縮してLMSにアップロードしてください。


