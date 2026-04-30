<script lang="ts" setup>
import AOS from 'aos';
import { onMounted, onUnmounted, ref } from "vue";

const props = withDefaults(defineProps<{
  talk: { image: string, textHtml: string, right: string }[]
}>(), {
  talk: () => []
})

const talkList = ref<HTMLElement>()

let container = null

const refresh = (evt) => {
  // console.log('wrapper scrolling....')
  AOS.refresh()
}

const findContainer = (): HTMLElement => {

  let target: HTMLElement = null
  let result = null
  // console.log('findContainer::::', talkList.value)
  target = talkList.value
  while (target.parentNode !== document) {
    target = target.parentNode
    if (target.classList.contains('resizable-frame-side')) {
      result = target
      break;
    }
  }

  if (!result) {
    document.querySelector('html').classList.add('html-scroll')
  }

  return result || document.querySelector('#wrapper')
}

onMounted(() => {
  container = findContainer()
  container.addEventListener('scroll', refresh)
  AOS.init()
})

onUnmounted(() => {
  document.querySelector('html').classList.remove('html-scroll')
  container.removeEventListener('scroll', refresh)
  AOS.refresh()
})

</script>

<template>

  <div class="talk-list" ref="talkList">

    <div
        :class="[ 'talk-list-serif' ]"
        v-for="(serif, i) in props.talk"
        :key="i"
    >
      <talk-serif
          data-aos="fade-up"
          :image="serif.image"
          :text-html="serif.textHtml"
          :right="serif.right"
      />
    </div>

  </div>

</template>

<style>

.talk-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

</style>