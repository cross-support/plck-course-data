<script setup lang="ts">
import BaseButton from "@/components/plck/base/BaseButton.vue";
import {usePlckStore} from "@/store/plck";
import { storeToRefs } from "pinia";

const { hasNextScene } = storeToRefs(usePlckStore())
const { toNextScene } = usePlckStore()

const handleClick = function () {
  toNextScene()
}
</script>
<template>
  <BaseButton v-if="($slots.default || $attrs.innerHTML) && hasNextScene" @click.prevent="handleClick"><slot /></BaseButton>
</template>