<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, watch} from 'vue'

const props = withDefaults(defineProps<{
  initialWidth: number
  mainSide: 'left' | 'right'
}>(), {
  initialWidth: 500,
  mainSide: 'right'
})

const handleWidth = 5

const mainFrameWidth = ref(props.initialWidth)
const windowWidth = ref(0)
const isDragging = ref(false)
const dragStartPosition = ref(0)
const dragStartMainFrameWidth = ref(0)

const frameSizeStyle = computed(() => {
  if (!windowWidth.value) {
    return { 'grid-template-columns': `49.5% ${handleWidth}px 49.5%` }
  }
  const subWindowSize = windowWidth.value - mainFrameWidth.value - handleWidth
  return { 'grid-template-columns': `${subWindowSize}px ${handleWidth}px ${mainFrameWidth.value}px` }
})

function onDrag(evt) {
  // console.log(evt)
  isDragging.value = true
  dragStartPosition.value = evt.pageX
  dragStartMainFrameWidth.value = mainFrameWidth.value
  document.body.classList.add('drag-start')
}

function onUnDrag(evt) {
  // console.log(evt)
  isDragging.value = false
  //リセット
  dragStartPosition.value = 0
  document.body.classList.remove('drag-start')
}

function onMouseMove(evt) {
  if (isDragging.value) {
    // console.log('drag moving', evt.pageX)
    let movedValue = evt.pageX - dragStartPosition.value
    // console.log({ movedValue })
    switch (props.mainSide) {

      case 'right':
        movedValue = -movedValue
        mainFrameWidth.value = dragStartMainFrameWidth.value + movedValue
        break;
      case 'left':
        mainFrameWidth.value = dragStartMainFrameWidth.value - movedValue
        break;

    }
  }
}

// デバウンス用のタイマー
let timer = null
function onWindowResize() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    calcWindowSize()
  }, 100)
}

function calcWindowSize() {
  windowWidth.value = window.innerWidth
}

watch(isDragging, (newValue) => {

  if (newValue === true) {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onUnDrag)
  }
  if (newValue === false) {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onUnDrag)
  }

})

onMounted(() => {
  calcWindowSize()
  window.addEventListener('resize', onWindowResize)
  document.body.classList.add('is-resizable-window')
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', onWindowResize)
  document.body.classList.remove('is-resizable-window')
})

</script>
<template>
  <div class="resizable-frame-wrapper" :style="frameSizeStyle">

    <div class="resizable-frame-side main">
      <slot name="main" />
    </div>

    <div class="resizable-frame-handle" @mousedown="onDrag"></div>

    <div class="resizable-frame-side sub">
      <slot name="sub" />
    </div>

  </div>
</template>
<style>

body.drag-start * {
  user-select: none;
}

.resizable-frame-wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  grid-auto-columns: 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 0px 0px;
  grid-template-areas:
    "grid1 handle grid2"
    "grid1 handle grid2"
    "grid1 handle grid2";
}

.resizable-frame-side.main {
  grid-area: grid1;
}

.resizable-frame-side.sub {
  grid-area: grid2;
}

.resizable-frame-side {
  overflow-y: scroll;
}

.resizable-frame-handle {
  background: #000;
  grid-area: handle;
}

.resizable-frame-handle:hover {
  cursor: col-resize;
}

.resizable-frame-side {
  position: relative;
}

@media (max-width: 768px) {
  .resizable-frame-side {
    overflow: hidden;
  }
  .resizable-frame-wrapper {
    display: block;
  }
  .resizable-frame-handle {
    display: none;
  }
}

</style>