<script setup>
import BaseButton from "@/components/plck/base/BaseButton.vue";
import {usePlckStore} from "@/store/plck";
import { storeToRefs } from "pinia";

/**
 * 次のユニットに移動するボタンを表示する条件
 * 次のユニットがありかつ最後のシーン（フレーム）であること
 */
const { hasNextUnit, isLastFrame } = storeToRefs(usePlckStore())
const { toNextUnit } = usePlckStore()

const handleClick = function () {
  toNextUnit()
}
</script>
<template>
  <BaseButton v-if="($slots.default || $attrs.innerHTML) && hasNextUnit && isLastFrame" @click.prevent="handleClick"><slot /></BaseButton>
</template>