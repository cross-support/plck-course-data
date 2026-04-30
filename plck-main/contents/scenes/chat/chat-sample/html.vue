<template>
  <article class="chatWrap">
    <div class="chatContentInner">
      <div class="header">
        <h1>{{text.headerText}}</h1>
      </div>
      <div class="body">

        <!--   # HTMLタグを使用するときは、直接タグの中に読み込むのではなく、v-html属性を使用して設置してください  -->
        <!--   # v-htmlの使い方: https://ja.vuejs.org/api/built-in-directives.html#v-html    -->
        <p v-html="text.descriptionBody"></p>

        <!--   # vueのテンプレートですので、v-forなどのループディレクティブも使用することができます。   -->
        <ul class="list">
          <li v-for="(listItem, i) in text.listItems" :key="i">{{listItem}}</li>
        </ul>

        <ul class="list">
          <li>{{ text.listItem1 }}</li>
          <li>{{ text.listItem2 }}</li>
          <li>{{ text.listItem2 }}</li>
        </ul>

        <!--   # 単純に定義した配列にアクセスする場合は text.array[0] のように記述します   -->
        <p>リストの最初の要素: {{text.listItems[0]}}</p>

      </div>

      <div class="body">
        <!--   # チャットを表示する場合は、talk-context タグを使用します。 :talk属性にchatで定義したスレッドを渡してください。   -->
        <talk-context :talk="chat.thread1" />
      </div>

      <h2 class="subTitle">{{text.subTitle}}</h2>

      <div class="body">
        <talk-context :talk="chat.thread2" />
      </div>

    </div>

    <div v-if="!isMainScene" class="btnWrapper">
      <button-prev-scene>{{text.prevButton}}</button-prev-scene>
      <button-next-scene>{{text.nextButton}}</button-next-scene>
    </div>
  </article>
</template>

<style scoped>
/* stylesheetはこちらに記述します */
.chatWrap {
  background: #fff;
  padding-bottom: 32px;
}

.chatContentInner {
  max-width: 980px;
  margin: 32px auto;
}

.header h1 {
  font-size: 32px;
  border-bottom: 1px solid #fa3d5e;
}

.body {
  margin: 16px 0;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #fa3d5e;
  background: #ffe4e4;
}

.btnWrapper {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .chatContentInner {
    width: auto;
    margin: 16px 8px;
  }

  .btnWrapper {
    flex-direction: column;
  }
}

/* main sub で組み合わせた際のスタイル指定 */
.resizable-frame-side .chatContentInner {
  width: auto;
  margin: 32px 8px;
}

</style>