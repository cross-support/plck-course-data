<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue"
import ResizableFrame from "@/components/plck/base/ResizableFrame.vue";

const headerHeight = ref(0)
const windowHeight = ref(window.innerHeight)
let timer = null
let resizeObserver = null
let lastDocSize = { w: 0, h: 0 }

const calcHeight = () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    const header = document.querySelector('.frame-header')
    if (!header) return
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
  if (document.readyState === 'complete') {
    calcHeight()
  } else {
    window.addEventListener('load', calcHeight)
  }

  // layout settle 後の最初のフレームで再計算
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      calcHeight()
    })
  })

  // iframe の高さが後から確定するケースに対応
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      const { clientWidth: w, clientHeight: h } = document.documentElement
      if (w === lastDocSize.w && h === lastDocSize.h) return
      lastDocSize = { w, h }
      calcHeight()
    })
    resizeObserver.observe(document.documentElement)
  }
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
  window.removeEventListener('resize', calcHeight)
  window.removeEventListener('load', calcHeight)
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
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