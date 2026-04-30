import { describe, it, expect } from "vitest";
import QuizI18n from "../../../../plck/i18n/quiz/QuizI18n.ts";
import {I18nList} from "../../../../plck/i18n/l18n.type";
import {QuizConfigPerLocale} from "@corePlck/components/scene/scene/quiz/quiz.type.ts";

describe('QuizI18n', () => {

    it('シーン:クイズの言語翻訳データリスト処理が正しく行われるか', () => {

        const testFile = {
            'ja': {
                title: 'タイトル',
                batsu_text: '×',
                maru_text: '〇',
                btn_answer_name: 'ボタン:回答',
                btn_confirm_name: 'ボタン:確認',
                btn_mark_name: 'ボタン:マーク',
                btn_next_name: 'ボタン:次',
                btn_prev_name: 'ボタン:前',
                retry_btn_name: 'ボタン:リトライ',
                btn_next_unit: 'ボタン:次のユニット',
                btn_next_scene: 'ボタン:次のシーン',
                confirm_table_description_text: '確認画面詳細テキスト',
                mark_table_description_text: '回答画面詳細テキスト',
                guide_pretext: '解説',
                passed_text: '合格',
                failure_text: '不合格',
                table_answer_text: '回答',
                table_result_text: '結果',
                table_batsu_text: '×',
                table_maru_text: '〇',
                questions: [
                    {
                        quiz_type: 'select',
                        alternatively: 'single',
                        title: '第1問',
                        quiz_text: '問題文1',
                        choices: [
                            '選択肢1',
                            '選択肢2'
                        ],
                        correct: 1,
                        explanation: '解説文1'
                    },
                    {
                        quiz_type: 'select',
                        alternatively: 'single',
                        title: '第2問',
                        quiz_text: '問題文2',
                        choices: [
                            '選択肢3',
                            '選択肢4'
                        ],
                        correct: 1,
                        explanation: '解説文2'
                    },

                ]
            },
            'en': {
                title: 'title',
                batsu_text: 'x',
                maru_text: 'check',
                btn_answer_name: 'button:answer',
                btn_confirm_name: 'button:confirm',
                btn_mark_name: 'button:mark',
                btn_next_name: 'button:next',
                btn_prev_name: 'button:prev',
                btn_next_unit: 'button:next unit',
                btn_next_scene: 'button:next scene',
                retry_btn_name: 'button:retry',
                confirm_table_description_text: 'confirmDescription',
                mark_table_description_text: 'markDescription',
                guide_pretext: 'guide',
                passed_text: 'passed',
                failure_text: 'failure',
                table_answer_text: 'answer',
                table_result_text: 'result',
                table_batsu_text: 'x',
                table_maru_text: 'check',
                questions: [
                    {
                        quiz_type: 'select',
                        alternatively: 'single',
                        title: 'No.1',
                        quiz_text: 'quiz1',
                        choices: [
                            'choice1',
                            'choice2'
                        ],
                        correct: 1,
                        explanation: 'explanation1'
                    },
                    {
                        quiz_type: 'select',
                        alternatively: 'single',
                        title: 'No.2',
                        quiz_text: 'quiz2',
                        choices: [
                            'choice3',
                            'choice4'
                        ],
                        correct: 1,
                        explanation: 'explanation2'
                    },

                ]
            }
        } as QuizConfigPerLocale

        const list = {} as I18nList

        const quizI18n = new QuizI18n(testFile, 'test-scene-name', list)
        const newList = quizI18n.generate()
        // console.log(newList)
        expect(newList.ja['test-scene-name_title']).toBe('タイトル')
        expect(newList.ja['title.test-scene-name']).toBe('タイトル')
        expect(newList.ja['test-scene-name_retry_btn_name']).toBe('ボタン:リトライ')
        expect(newList.ja['test-scene-name_btn_answer_name']).toBe('ボタン:回答')
        expect(newList.ja['test-scene-name_btn_confirm_name']).toBe('ボタン:確認')
        expect(newList.ja['test-scene-name_btn_mark_name']).toBe('ボタン:マーク')
        expect(newList.ja['test-scene-name_btn_next_name']).toBe('ボタン:次')
        expect(newList.ja['test-scene-name_btn_prev_name']).toBe('ボタン:前')
        expect(newList.ja['test-scene-name_btn_next_name']).toBe('ボタン:次')
        expect(newList.ja['test-scene-name_btn_next_unit']).toBe('ボタン:次のユニット')
        expect(newList.ja['test-scene-name_btn_next_scene']).toBe('ボタン:次のシーン')


    })


})