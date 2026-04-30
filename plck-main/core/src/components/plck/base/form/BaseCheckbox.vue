<script setup lang="ts">
import {computed} from "vue";

defineOptions({
  inheritAttrs: false,
  name: 'BaseCheckbox'
})

const props = withDefaults(defineProps<{
  id: string
  disabled: boolean
  modelValue: any
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
  <div :class="[ 'base-checkbox', { 'base-checkbox-disabled': props.disabled } ]">
    <input v-model="_value" :id="props.id" v-bind="$attrs" type="checkbox" :disabled="props.disabled" />
    <label :for="props.id"><slot /></label>
  </div>
</template>
<style>

.base-checkbox {
  position: relative;
  left: 0;
  cursor: pointer;
}

.base-checkbox input[type=checkbox] {
  display: none;
}

.base-checkbox label {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  vertical-align: middle;
  cursor: pointer;
  padding: 10px 0 10px;
}

/*チェックボックス(枠)*/
.base-checkbox label:before{
  transition: border-color 0.1s linear;
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 2px solid #A6A6A6;
  border-radius: 5px;
  content: '';
}

.base-checkbox label:after {
  transition: opacity 0.1s linear;
  position: absolute;
  top: 6px;
  left: 8px;
  display: inline-block;
  width: 12px;
  height: 22px;
  border-right: 3px solid #666;
  border-bottom: 3px solid #444;
  content: '';
  opacity: 0;
  z-index: 10;
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

.base-checkbox-disabled label:before {
  opacity: 0.3;
}

.base-checkbox input[type=checkbox]:checked + label:after {
  opacity: 1;
}

</style>