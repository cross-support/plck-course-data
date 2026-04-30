<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue"
import ResizableFrame from "@/components/plck/base/ResizableFrame.vue";

const headerHeight = ref(0)
const windowHeight = ref(window.innerHeight)
let timer = null

const calcHeight = () => {
  if (timer) clearTimeout(timer)
  setTimeout(() => {
    const header = document.querySelector('.frame-header')
    console.log(header, header.clientHeight)
    headerHeight.value = header.clientHeight
    windowHeight.value = window.innerHeight
  }, 10)
}

const style = computed(() => {
  return {
    height: windowHeight.value - headerHeight.value + 'px'
  }
})


onMounted(() => {
  calcHeight()
  window.addEventListener('resize', calcHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', calcHeight)
})

</script>
<template>
  <div class="frame" :style="style">

    <template v-if="$slots.subScene">
      <resizable-frame>
        <template #sub>
          <slot name="subScene" />
        </template>
        <template #main><slot /></template>
      </resizable-frame>
    </template>

    <template v-else>
      <slot />
    </template>

  </div>
</template>
<style>
/*コンテンツ表示枠*/
.frame{
  width: 100%;
  //height: calc(100vh - 10%);
  background-color: #fff;
}
@media (max-width: 768px) {
  .frame {
    height: auto !important;
  }
}
</style>