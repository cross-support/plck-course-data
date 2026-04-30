<script setup lang="ts">

import {computed} from "vue";

defineOptions({
  // 属性継承の無効化
  inheritAttrs: false,
  name: 'BaseRadio'

})

const props = withDefaults(defineProps<{
  id: string
  disabled: boolean,
  modelValue: any,
}>(), {
  disabled: false
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
  <div :class="[ 'base-radio', { 'base-radio-disabled': props.disabled } ]">
    <input v-model="_value" :id="props.id" v-bind="$attrs" type="radio" :disabled="props.disabled" />
    <label :for="props.id"><slot /></label>
  </div>
</template>
<style>

.base-radio {
  position: relative;
  left: 0;
}

.base-radio label {
  position: relative;
  display: flex;
  gap: 16px;
  align-items: center;
  cursor: pointer;
  vertical-align: middle;
  padding: 10px 0 10px;
}

.base-radio input[type=radio] {
  display: none;
}

.base-radio label:before {
  transition: border-color 0.1s linear;
  display: block;
  width: 22px;
  height: 22px;
  border: 3px solid #969696;
  border-radius: 50%;
  content: '';
}

.base-radio-disabled label:before {
  opacity: 0.3;
}

.base-radio label:after {
  transition: opacity 0.1s linear;
  position: absolute;
  left: 5px;
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #888;
  content: '';
  opacity: 0;
}

.base-radio input[type=radio]:checked + label:after {
  opacity: 1;
}

</style>