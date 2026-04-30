<script lang="ts" setup>

import type {QuizQuestion} from "@corePlck/components/scene/scene/quiz/quiz.type.ts";

const props = defineProps<{
  tableAnswerLabel: string
  explanation: string
  questions: QuizQuestion[]
  answers: any[]
}>()

const answerText = function (question: QuizQuestion, answer: string | number | string[] | number[]) {
  if (typeof answer === 'number') {
    return question.choices[answer - 1]
  }
  if (typeof answer === 'string') {
    return  answer
  }
  if (Array.isArray(answer)) {
    const result = answer.map(_a => {
      if (typeof _a === 'number') return question.choices[_a - 1]
      if (typeof  _a === 'string') return _a
    })
    return result.join('<br />')
  }
}

</script>
<template>
  <div class="quiz-confirm">

    <div class="quiz-confirm-detail">
      <table class="quiz-detail-table">
        <tr>
          <th>No.</th>
          <th>{{tableAnswerLabel}}</th>
        </tr>
        <tr v-for="(question, i) in props.questions" :key="i" @click="$emit('click-result', i)">
          <td class="table-center">{{i+1}}</td>
          <td v-html="answerText(question, props.answers[i])"></td>
        </tr>
      </table>
      <p v-if="explanation" class="quiz-detail-explanation">{{explanation}}</p>
    </div>

  </div>
</template>
