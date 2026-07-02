<script setup lang="ts">
import BaseButton from "@/components/plck/base/BaseButton.vue";
import {usePlckStore} from "@/store/plck";

const { toShowPopup } = usePlckStore()

const handleClick = function () {
  toShowPopup()
}
</script>
<template>
  <BaseButton v-if="$slots.default || $attrs.innerHTML" @click.prevent="handleClick"><slot /></BaseButton>
</template>
