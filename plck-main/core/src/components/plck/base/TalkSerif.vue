<script lang="ts" setup>

import {computed} from "vue";

const props = withDefaults(defineProps<{
  image: string,
  textHtml: string,
  left?: 'on' | 'off',
  right?: 'on' | 'off',
}>(), {
  image: '',
  textHtml: '',
  left: 'on',
  right: 'off'
})

const sideIsRight = computed(() => {
  return props.right === 'on'
})

</script>
<template>
  <div :class="['talk-serif', { 'talk-serif-left': !sideIsRight }, { 'talk-serif-right': sideIsRight } ]">
    <div class="talk-serif-img">
      <img :src="props.image" />
    </div>
    <div class="talk-serif-serif" v-html="props.textHtml"></div>
  </div>
</template>

<style>

.talk-serif {
  display: flex;
  align-items: flex-start;
}

.talk-serif-right {
  justify-content: flex-end;
}

.talk-serif img {
  width: 100px;
}

.talk-serif-right .talk-serif-img {
  order: 2;
}

.talk-serif-left .talk-serif-serif {
  margin-left: 15px;
  border: 3px solid #5caa98;
  background: #fff;
}

.talk-serif-left .talk-serif-serif:before {
  border-right: 15px solid #5caa98;
  content: "";
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  position: absolute;
  left: -15px;
  top: 10px;
}

.talk-serif-right .talk-serif-serif:after {
  content: "";
  border-left: 15px solid #df744a;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  position: absolute;
  right: -15px;
  top: 10px;
}

.talk-serif-right .talk-serif-serif {
  order: 1;
  margin-right: 15px;
  background: #fff;
  border: 3px solid #df744a;
}

.talk-serif-serif {
  position: relative;
  padding: 6px;
  border-radius: 10px;
}


</style>