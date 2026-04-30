<script lang="ts" setup>
import {h, computed} from "vue";
import { compile } from 'vue/dist/vue.esm-bundler.js'


/**
 * テキストベースんのクイズの文字列を解析し、問題コンポーネントを作成する
 * ユーザーの入力内容に応じてコンポーネントを都度生成する必要があるため、ランタイム版のコンパイラを使用してコンポーネントを定義する
 */
const props = withDefaults(defineProps<{
  quizString: string
  modelValue: any
  disabled: boolean
}>(), {
  disabled: false
})

const emits = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()


/**
 * 動的にコンポーネントを生成
 * runtime版のcompileをインポートして処理を行う
 * TODO: bundle版で正しく動作するか要確認
 * 注意: 関数コンポーネントとなるため、dataやcomputedなどを使用できないため注意が必要。（composition APIで注入は可能かとおもわれるが。。）
 */
const QuizComponent = computed(() => {

  /**
   * %input%や%input[{number}]%の入力をbase-inputに変更する
   */
  const replacedStr = props.quizString.replace(/%input(\[([0-9]*)\]|)%/g, '<base-input maxlength="100" :id="`${id}_$2`" :model-value="modelValue$1" @update:model-value="(value) => $emit(\'update:modelValue\', { value, index: \'$2\' })" :disabled="disabled" />')
  // console.log(replacedStr)
  const compiled = compile(replacedStr)

  return {
    props: [ 'modelValue', 'disabled', 'id' ],
    name: 'QuizComponent',
    render: compiled
  }
})

const render = () => {
  return h(QuizComponent.value, {
    id: 'quiz',
    disabled: props.disabled,
    modelValue: props.modelValue,
    'onUpdate:modelValue': ({ value, index }) => {
      // console.log('update!!!!', value, index)
      if (index) {
        const newVal = [ ...props.modelValue ]
        newVal[parseInt(index)] = value
        emits('update:modelValue', newVal)
      } else {
        emits('update:modelValue', value)
      }
    }
  })
}

</script>
<template>
  <render />
</template>