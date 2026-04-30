<script setup lang="ts">

import {computed} from "vue";

defineOptions({
  // 属性継承の無効化
  inheritAttrs: false,
  name: 'BaseInput'
})

const props = withDefaults(defineProps<{
  id: string
  disabled: boolean,
  modelValue: any,
}>(), {
  disabled: false,
  modelValue: '',
})

const emits = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const _value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emits('update:modelValue', value)
  }
})

</script>

<template>
  <input class="base-input" v-model="_value" :id="props.id" v-bind="$attrs" type="text" :disabled="props.disabled" />
</template>
<style>
.base-input {

}
</style>