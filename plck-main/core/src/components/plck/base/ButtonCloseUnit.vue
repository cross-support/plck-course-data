<script setup lang="ts">
import BaseButton from "@/components/plck/base/BaseButton.vue";
import {usePlckStore} from "@/store/plck";
import { storeToRefs } from "pinia";

const { isAllSceneCompleted, isLastFrame } = storeToRefs(usePlckStore())

const handleClick = function () {
  window.close()
}
</script>
<template>
  <BaseButton v-if="($slots.default || $attrs.innerHTML) && isAllSceneCompleted && isLastFrame" @click.prevent="handleClick"><slot /></BaseButton>
</template>