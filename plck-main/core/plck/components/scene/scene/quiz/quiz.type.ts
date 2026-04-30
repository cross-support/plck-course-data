import { LanguageLocale } from "@corePlck/i18n/l18n.type.ts";
import { ButtonLabels } from "../common.type.ts";

export type QuestionsType = 'Q&A' | 'All&A'
export type QuizType = 'select' | 'text'
export type QuizAlternatively = 'single' | 'multiple'

export type QuizConfig = {
    title: string
    questions_type: QuestionsType
    domark: 'on' | 'off'
    display_pass: 'on' | 'off'
    display_score: 'on' | 'off'
    retry: 'on' | 'off'
    retry_btn_name: string
    block_next_when_retry: 'on' | 'off'
    passing_mark: number
    btn_answer_name: string
    btn_confirm_name: string
    btn_mark_name: string
    btn_next_name: string
    btn_prev_name: string
    maru_text: string
    batsu_text: string
    passed_text: string
    failure_text: string
    table_result_text: string
    table_answer_text: string
    table_maru_text: string
    table_batsu_text: string
    confirm_table_description_text: string
    mark_table_description_text: string
    guide_pretext: string
    questions: QuizQuestion[]
} & ButtonLabels


export type QuizQuestion = {
    quiz_type: QuizType
    alternatively: QuizAlternatively
    title: string
    quiz_text: string
    choices?: string[]
    text?: string
    correct: number | string | any[]
    explanation: string
}

export type QuizState = {
    currentQuizIndex: number
    answers: any[]
    showResult: boolean
    showConfirm: boolean
    fromResult: boolean
    fromConfirm: boolean
}


export type QuizConfigPerLocale = {
    [key in LanguageLocale]?: QuizConfig
}