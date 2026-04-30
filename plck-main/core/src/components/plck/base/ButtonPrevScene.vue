<script setup>
import BaseButton from "@/components/plck/base/BaseButton.vue";
import {usePlckStore} from "@/store/plck";
import { storeToRefs } from "pinia";

const { hasPrevScene } = storeToRefs(usePlckStore())
const { toPrevScene } = usePlckStore()

const handleClick = function () {
  toPrevScene()
}
</script>
<template>
  <BaseButton v-if="hasPrevScene" @click.prevent="handleClick"><slot /></BaseButton>
</template>