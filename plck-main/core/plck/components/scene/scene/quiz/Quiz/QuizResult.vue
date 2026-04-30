<script lang="ts" setup>

import type {QuestionResultData} from "@corePlck/repository/repository.type.ts";
import type {QuizQuestion} from "@corePlck/components/scene/scene/quiz/quiz.type.ts";
import {computed} from "vue";

const props = defineProps<{
  result: boolean
  failureLabel: string
  passLabel: string
  failureIconLabel: string
  tableResultLabel: string
  tableAnswerLabel: string
  tablePassLabel: string
  tableFailureLabel: string
  passIconLabel: string
  questions: QuizQuestion[]
  explanation: string
  score: number
  showScore: boolean
  showPass: boolean
  answers: QuestionResultData[]
}>()

const label = computed(() => {
  return props.result ? props.passLabel : props.failureLabel
})

const iconLabel = computed(() => {
  return props.result ? props.passIconLabel : props.failureIconLabel
})

const tableLabel = computed(() => {
  return (_result) => {
    return _result ? props.tablePassLabel : props.tableFailureLabel
  }
})

const answerText = function (question: QuizQuestion, answer: QuestionResultData) {
  if (typeof answer.selectedAnswer === 'number') {
    return question.choices[answer.selectedAnswer - 1]
  }
  if (typeof answer.selectedAnswer === 'string') {
    return  answer.selectedAnswer
  }
  if (Array.isArray(answer.selectedAnswer)) {
    const result = answer.selectedAnswer.map(_a => {
      if (typeof _a === 'number') return question.choices[_a - 1]
      if (typeof  _a === 'string') return _a
    })
    return result.join('<br />')
  }
}

</script>
<template>
  <div class="quiz-result">

    <div class="quiz-result-summary">
      <div v-if="showPass" :class="[ 'quiz-result-summary-label', { 'quiz-result-summary-label-passed': props.result }, { 'quiz-result-summary-label-failure': !props.result } ]" v-html="label"></div>
      <div v-if="showScore" class="quiz-result-summary-score">{{score}}/100</div>
      <div v-if="showPass" :class="[ 'quiz-result-summary-icon-label', { 'quiz-result-summary-icon-label-passed': props.result }, { 'quiz-result-summary-icon-label-failure': !props.result } ]" v-html="iconLabel"></div>
    </div>

    <div class="quiz-result-detail">
      <table class="quiz-detail-table">
        <tr>
          <th>No.</th>
          <th style="width: 60px">{{tableResultLabel}}</th>
          <th>{{tableAnswerLabel}}</th>
        </tr>
        <tr v-for="(question, i) in props.questions" :key="i" @click="$emit('click-result', i)">
          <td class="table-center">{{i+1}}</td>
          <td class="table-center" v-html="tableLabel(props.answers[i].result)"></td>
          <td v-html="answerText(question, props.answers[i])"></td>
        </tr>
      </table>
      <p v-if="explanation" class="quiz-detail-explanation">{{explanation}}</p>
    </div>

  </div>
</template>