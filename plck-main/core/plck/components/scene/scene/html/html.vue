<template>
  <div class="htmlWrap">
    <div class="content">
      <p class="html-text" v-html="text.text_html"></p>
      <ul class="list">
        <li class="list-item">{{text.list_item1}}</li>
        <li class="list-item">{{text.list_item2}}</li>
      </ul>

      <div v-if="!isMainScene" class="btnWrapper">
        <button-prev-scene v-html="text.prev_button" />
        <button-next-scene v-html="text.next_button" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/**
CSSをここに記述できます。
*/
.html-text {
  color: blue;
  font-size: 12px;
}

.htmlWrap {
  background: #fff;
}

.content {
  width: 980px;
  margin: 32px auto;
}

.btnWrapper {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .content {
    width: auto;
    margin: 16px;
  }
  .btnWrapper {
    flex-direction: column;
  }
}
</style>
