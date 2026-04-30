import { describe, it, expect } from "vitest";
import {I18nList} from "../../../../plck/i18n/l18n.type";
import {SlideConfigPerLocale} from "../../../../plck/components/scene/scene/slide/slide.type.ts";
import SlideI18n from "../../../../plck/i18n/slide/SlideI18n.ts";

describe('QuizI18n', () => {

    it('シーン:クイズの言語翻訳データリスト処理が正しく行われるか', () => {

        const testFile = {
            'ja': {
                title: 'スライドタイトル',
                btn_next_scene_name: '次へ',
                slide_speed: 10,
                img: [
                    'image1',
                    'image2',
                    'image3'
                ]
            },
            'en': {

                title: 'slide title',
                btn_next_scene_name: 'next',
                slide_speed: 10,
                img: [
                    'image-eng1',
                    'image-eng2',
                    'image-eng3'
                ]
            },
        } as SlideConfigPerLocale

        const list = {} as I18nList

        const slideI18n = new SlideI18n(testFile, 'test-scene-name', list)
        const newList = slideI18n.generate()

        console.log(newList)

        expect(newList.ja['test-scene-name_title']).toBe('スライドタイトル')
        expect(newList.ja['title.test-scene-name']).toBe('スライドタイトル')
        expect(newList.ja['test-scene-name_btn_next_scene_name']).toBe('次へ')
        expect(newList.en['test-scene-name_title']).toBe('slide title')
        expect(newList.en['title.test-scene-name']).toBe('slide title')
        expect(newList.en['test-scene-name_btn_next_scene_name']).toBe('next')

    })


})