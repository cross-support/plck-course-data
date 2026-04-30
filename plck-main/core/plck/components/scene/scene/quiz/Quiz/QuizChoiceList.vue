<script lang="ts" setup>

import BaseRadio from "@/components/plck/base/form/BaseRadio.vue";
import BaseCheckbox from "@/components/plck/base/form/BaseCheckbox.vue";
import {computed} from "vue";

const props = withDefaults(defineProps<{
  choices: string[],
  multiple: boolean,
  modelValue: any,
  correct: any,
  disabled: boolean,
}>(), {
  choices: () => [],
  multiple: false,
  disabled: false,
  correct: null
})

const emits = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const isCorrect = function (index) {
  if (props.disabled) {
    if (props.multiple) {
      console.log(props.multiple, props.correct)
      return (props.correct as number[]).includes(index + 1)
    } else {
      return props.correct === index + 1
    }
  }
  return false
}

const _value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    console.log(value)
    emits('update:modelValue', value)
  },
})


</script>
<template>
  <div class="quiz-choice-list">

    <ul v-if="!multiple">
      <li v-for="(choice, i) in props.choices" :key="i" :class="[ 'quiz-choice-list-item', { 'quiz-choice-list-item-correct': isCorrect(i) } ]">
        <base-radio v-model="_value" :id="`quiz_choice_${i}`" :value="i+1" name="quiz" :disabled="props.disabled">{{choice}}</base-radio>
      </li>
    </ul>

    <ul v-else-if="multiple">
      <li v-for="(choice, i) in props.choices" :key="i" :class="[ 'quiz-choice-list-item', { 'quiz-choice-list-item-correct': isCorrect(i) } ]">
        <base-checkbox v-model="_value" :id="`quiz_choice_${i}`" :value="i+1" name="quiz" :disabled="props.disabled">{{choice}}</base-checkbox>
      </li>
    </ul>

  </div>
</template>