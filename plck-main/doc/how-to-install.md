# PLCKコンテンツの開発環境のインストール方法

**ここから先の作業については、コマンドラインを使用する必要があります。<br />コマンドラインはWindowおよびMac/Linuxで一部操作が違います**

PLCKのファイルをgitからダウンロードしてきた直後は、開発に必要なパッケージがインストールされていない状態です。<br />
まずはパッケージのインストールを行います。

1. PLCKのディレクトリにコマンドラインで移動します。

**Windows**
```shell
# cdを使ってPLCKのディレクトリまで移動
$ cd path\to\plck
```

 ※zipでダウンロードした場合は、plck-mainというディレクトリ名となります。
 ```shell
 $ cd path\to\plck-main
 ```

**Mac/Linux**
```shell
# cdを使ってPLCKのディレクトリまで移動
$ cd path/to/plck
```

2. 移動したら、`npm install` を実行してパッケージをインストールします

**Windows/Mac/Linux**
```shell
$ npm install
```

3. コマンドラインを実行できるようにするため、以下のコマンドを実行します

**Windows/Mac/Linux**
```shell
$ npm install -g
```

インストールが完了したら開発をスタートすることができます。
詳細は[コンテンツ開発の進め方](./how-to-develop.md)を参照してください。

