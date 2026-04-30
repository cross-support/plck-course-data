<script setup lang="ts">
import { watch, nextTick, reactive } from 'vue'
import {useMenu} from './frameMenu'
import prevMenuSvg from '../../../../../contents/frame/menu/assets/mPrev.svg'
import nextMenuSvg from '../../../../../contents/frame/menu/assets/mNext.svg'
import LocaleSelector from "@/components/plck/base/LocaleSelector.vue";

const props = defineProps<{
  open: boolean
}>()

const emits = defineEmits<{
  (e: 'close-menu'): void
}>()

const {
  currentMenuListItem,
  state,
  menuItemPageLength,
  isMultiLang,
  hasNextPage,
  hasPrevPage,
  toPrevPage,
  toNextPage,
  onChangeScene,
} = useMenu()

const uiState = reactive({
  effect: false
})

watch(() => props.open, (newValue, prevValue) => {
  // デバッグコードですかね？削除お願いします。
  // 回答: 削除しました。
  if (prevValue === false && newValue === true) {
    nextTick(() => {
      setTimeout(() => {
        uiState.effect = true
      }, 100)
    })
  } else {
    uiState.effect = false
  }
})

const handleClose = () => {
  emits('close-menu')
}


const changeLocale = (e) => {
  emits('close-menu')
}

const changeScene = (i) => {
  onChangeScene(i)
  emits('close-menu')
}


</script>
<template>

  <div :class="['st-container', 'st-effect-1', { 'st-menu-open': uiState.effect }]"
       :style="`display: ${open ? 'block' : 'none'}`"
  >

    <nav :class="['st-menu', 'st-effect-1' ]">

      <!-- Change lang -->
      <locale-selector v-if="isMultiLang" @locale-changed="changeLocale"></locale-selector>

      <div class="close_st-container">
        <a href="javascript:void(0)" @click="handleClose">×</a>
      </div>

      <ul class="list_scene_menu nav nav-stacked">
        <li
            v-for="(item) in currentMenuListItem"
            :key="item.title"
            :class="[ { 'checkComplete': item.completed, 'selectedMenu': item.isCurrent }]"
        >
          <a :class="[ `icon_${item.type}` ]" href="javascript: void(0)" @click="changeScene(item.index)">{{item.title}}</a>
        </li>
      </ul>

      <div id="mPageCtrl" class="mPageCtrl">

        <button :disabled="!hasPrevPage" @click="toPrevPage">
          <img id="mBarPrev" :src="prevMenuSvg" alt="">
        </button>

        <span id="menuPageNum"> {{state.currentMenuPage+1}}/{{menuItemPageLength}} </span>

        <button :disabled="!hasNextPage" @click="toNextPage">
          <img id="mBarNext" :src="nextMenuSvg" alt="">
        </button>

      </div>

    </nav>

  </div>

</template>
<style scoped>
@import url(@frame/menu/style.css);
</style>