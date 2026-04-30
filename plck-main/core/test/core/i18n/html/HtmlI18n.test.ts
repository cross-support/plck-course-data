import { describe, it, expect } from "vitest";
import {I18nList} from "../../../../plck/i18n/l18n.type";
import {HtmlConfigPerLocale} from "@corePlck/components/scene/scene/html/html.type.ts";
import HtmlI18n from "../../../../plck/i18n/html/HtmlI18n.ts";

describe('HtmlI18n', () => {

    it('シーン:HTMLの言語翻訳データリスト処理が正しく行われるか', () => {

        const testFile = {
            'ja': {
                title: 'タイトル',
                full_template: false,
                texts: {
                    text_test: 'テスト',
                },
                chat: {
                    thread1: [
                        {
                            image: '画像1',
                            textHtml: 'テキスト1'
                        },
                        {
                            image: '画像2',
                            textHtml: 'テキスト2'
                        },
                    ],
                    thread2: [
                        {
                            image: '画像3',
                            textHtml: 'テキスト3'
                        },
                        {
                            image: '画像4',
                            textHtml: 'テキスト4'
                        },
                    ]
                }
            },
            'en': {
                title: 'title',
                full_template: false,
                texts: {
                    text_test: 'text',
                },
                chat: {
                    thread1: [
                        {
                            image: 'image1',
                            textHtml: 'text1'
                        },
                        {
                            image: 'image2',
                            textHtml: 'text2'
                        },
                    ],
                    thread2: [
                        {
                            image: 'image3',
                            textHtml: 'text3'
                        },
                        {
                            image: 'image4',
                            textHtml: 'text4'
                        },
                    ]
                }
            }
        } as HtmlConfigPerLocale

        const list = {} as I18nList

        const htmlI18n = new HtmlI18n(testFile, 'test-scene-name', list)
        const newList = htmlI18n.generate()


        // console.log(newList)

        expect(newList.ja['test-scene-name_title']).toBe('タイトル')
        expect(newList.ja['title.test-scene-name']).toBe('タイトル')
        expect(newList.ja['test-scene-name_thread1_0_image']).toBe('画像1')
        expect(newList.ja['test-scene-name_thread1_0_textHtml']).toBe('テキスト1')
        expect(newList.ja['test-scene-name_thread1_1_textHtml']).toBe('テキスト2')
        expect(newList.ja['test-scene-name_thread1_1_image']).toBe('画像2')

        expect(newList.en['test-scene-name_title']).toBe('title')
        expect(newList.en['title.test-scene-name']).toBe('title')
        expect(newList.en['test-scene-name_thread1_0_image']).toBe('image1')
        expect(newList.en['test-scene-name_thread1_0_textHtml']).toBe('text1')
        expect(newList.en['test-scene-name_thread1_1_textHtml']).toBe('text2')
        expect(newList.en['test-scene-name_thread1_1_image']).toBe('image2')


    })


})