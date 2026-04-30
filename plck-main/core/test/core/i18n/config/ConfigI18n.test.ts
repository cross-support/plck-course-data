import { describe, it, expect } from "vitest";
import ConfigI18n from "../../../../plck/i18n/config/ConfigI18n";
import {I18nList} from "../../../../plck/i18n/l18n.type";
import {PLCKConfigType} from "../../../../plck/config/config.type";

describe('ConfigI18n', () => {

    it('コンフィグの言語翻訳データリスト処理が正しく行われるか: multi_lang on の場合', () => {

        const testFile = {
            title: 'タイトル',
            popup_close_text: '閉じる',
            popup_explanation_text: 'このユニットは終了です',
            popup_next_unit_text: '次のユニット',
            default_lang: 'ja',
            label_text: 'ラベルテキスト',
            multi_lang: 'on',
            otherLocaleSettings: {
                en: {
                    title: 'title',
                    popup_close_text: 'close',
                    popup_explanation_text: 'done',
                    popup_next_unit_text: 'next unit',
                }
            }
        } as PLCKConfigType

        const list = {} as I18nList

        const configI18n = new ConfigI18n(testFile, list)
        const newList = configI18n.generate()

        // console.log(newList)

        expect(newList.ja.main_title).toBe('タイトル')
        expect(newList.ja.main_popup_close_text).toBe('閉じる')
        expect(newList.ja.main_popup_explanation_text).toBe('このユニットは終了です')
        expect(newList.ja.main_popup_next_unit_text).toBe('次のユニット')
        expect(newList.ja.main_label_text).toBe('ラベルテキスト')

        expect(newList.en.main_title).toBe('title')
        expect(newList.en.main_popup_close_text).toBe('close')
        expect(newList.en.main_popup_explanation_text).toBe('done')
        expect(newList.en.main_popup_next_unit_text).toBe('next unit')
        expect(newList.en.main_label_text).undefined

    })

    it('コンフィグの言語翻訳データリスト処理が正しく行われるか: multi_lang off の場合', () => {

        const testFile = {
            title: 'タイトル',
            popup_close_text: '閉じる',
            popup_explanation_text: 'このユニットは終了です',
            popup_next_unit_text: '次のユニット',
            default_lang: 'ja',
            label_text: 'ラベルテキスト',
            multi_lang: 'off',
            otherLocaleSettings: {
                en: {
                    title: 'title',
                    popup_close_text: 'close',
                    popup_explanation_text: 'done',
                    popup_next_unit_text: 'next unit',
                }
            }
        } as PLCKConfigType

        const list = {} as I18nList

        const configI18n = new ConfigI18n(testFile, list)
        const newList = configI18n.generate()

        // console.log(newList)

        expect(newList.ja.main_title).toBe('タイトル')
        expect(newList.ja.main_popup_close_text).toBe('閉じる')
        expect(newList.ja.main_popup_explanation_text).toBe('このユニットは終了です')
        expect(newList.ja.main_popup_next_unit_text).toBe('次のユニット')
        expect(newList.ja.main_label_text).toBe('ラベルテキスト')

        expect(newList.en).undefined

    })

})
