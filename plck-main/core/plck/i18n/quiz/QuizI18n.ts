import I18nMixin from "../I18nMixin";
import {I18nList, LanguageLocale} from "../l18n.type";
import {QuizConfigPerLocale} from "@corePlck/components/scene/scene/quiz/quiz.type.ts";

export default class QuizI18n extends I18nMixin {

    targetProperties = [
        'title',
        'retry_btn_name',
        'btn_answer_name',
        'btn_confirm_name',
        'btn_mark_name',
        'btn_next_name',
        'btn_prev_name',
        'btn_next_scene_name',
        'btn_next_unit_name',
        'btn_end_unit_name',
        'maru_text',
        'batsu_text',
        'passed_text',
        'failure_text',
        'table_result_text',
        'table_answer_text',
        'table_maru_text',
        'table_batsu_text',
        'confirm_table_description_text',
        'mark_table_description_text',
        'guide_pretext'
    ]

    generate(): I18nList {
        const list = this.assign()
        const config = this.sceneConfig as QuizConfigPerLocale
        // questionsプロパティーを追加
        (Object.keys(config) as LanguageLocale[]).forEach((locale: LanguageLocale) => {
            const questions = config[locale].questions
            // console.log(questions)
            questions.forEach((question, i) => {
                const current_question_label = `question_${i}`
                this.add(locale, `${current_question_label}_quiz_text`, question.quiz_text, list)
                this.add(locale, `${current_question_label}_title`, question.title, list)
                this.add(locale, `${current_question_label}_explanation`, question.explanation, list)
                const correctStr = (() => {
                    if (Array.isArray(question.correct)) {
                        return JSON.stringify(question.correct)
                    }
                    return question.correct + ''
                })()
                this.add(locale, `${current_question_label}_correct`, correctStr, list)
                switch (question.quiz_type) {
                    case 'select':
                        question.choices.forEach((choice, i) => {
                            const choice_label = `${current_question_label}_choice_${i}`
                            this.add(locale, choice_label, choice, list)
                        })
                        break;
                    case 'text':
                        this.add(locale, `${current_question_label}_text`,question.text, list)
                        break;
                }
            })
        })

        return list
    }
}