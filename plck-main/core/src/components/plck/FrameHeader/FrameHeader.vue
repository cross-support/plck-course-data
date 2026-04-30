<script lang="ts" setup>

import {useHeader} from "./frameHeader";

const { mainTitle, title, isCompleted, showMenu } = useHeader()
/**
 * イベント処理を生成
 * open-menu: メニューのクリックイベント
 */
const emits = defineEmits<{
  (e: 'toggle-menu'): void
}>()

const onMenuButtonClick = (): void => {
  emits('toggle-menu')
}


</script>
<template>
  <header :class="['frame-header', { 'complete_icon': isCompleted }]">


    <div id="scene_title">
      <span class="scene_title_main" v-html="mainTitle"></span>
      <br />
      <span class="scene_title_sub" v-html="title"></span>
    </div>

    <div id="scene_menu_btn">
      <button
          v-if="showMenu"
          type="button"
          class="hoverOpacity"
          @click="onMenuButtonClick"
      >MENU
      </button>
      <div v-else>

      </div>
    </div>

  </header>
</template>
<style scoped>
@import url(@frame/header/style.css);
</style>