import { describe, it, expect } from "vitest";
import VideoI18n from "../../../../plck/i18n/video/VideoI18n";
import {ConfigPerLocale, I18nList} from "../../../../plck/i18n/l18n.type";

describe('VideoI18n', () => {

    it('シーン:ビデオの言語翻訳データリスト処理が正しく行われるか', () => {

        const testFile = {
            'ja': {
                title: '日本語',
                video_url: 'test.com',
                btn_next_scene_name: '次のシーンへ',
                btn_next_unit_name: '次のユニットへ',
                btn_end_unit_name: '最後のユニットへ'
            },
            'en': {
                title: 'english',
                video_url: 'test.com',
                btn_next_scene_name: 'next scene',
                btn_next_unit_name: 'next unit',
                btn_end_unit_name: 'last unit'
            }
        } as ConfigPerLocale

        const list = {} as I18nList

        const videoI18n = new VideoI18n(testFile, 'test-scene-name', list)
        const newList = videoI18n.assign()
        // console.log(newList)

        expect(newList.ja['test-scene-name_title']).exist
        expect(newList.ja['test-scene-name_btn_next_scene_name']).exist
        expect(newList.ja['test-scene-name_btn_next_unit_name']).exist
        expect(newList.ja['test-scene-name_btn_end_unit_name']).exist
        expect(newList.ja['test-scene-name_video_url']).exist
        expect(newList.en['test-scene-name_title']).exist
        expect(newList.en['test-scene-name_btn_next_scene_name']).exist
        expect(newList.en['test-scene-name_btn_next_unit_name']).exist
        expect(newList.en['test-scene-name_btn_end_unit_name']).exist
        expect(newList.en['test-scene-name_video_url']).exist

    })

    it('シーン:プロパティーが存在しない場合に、そのプロパティーがスキップされて登録が完了されるか', () => {

        const testFile = {
            'ja': {
                title: '日本語',
                video_url: 'test.com',
                btn_next_unit_name: '次のユニットへ',
                btn_end_unit_name: '最後のユニットへ'
            },
            'en': {
                title: 'english',
                video_url: 'test.com',
                btn_next_scene_name: 'next scene',
                btn_next_unit_name: 'next unit',
                btn_end_unit_name: 'last unit'
            }
        } as ConfigPerLocale

        const list = {} as I18nList

        const videoI18n = new VideoI18n(testFile, 'test-scene-name', list)
        const newList = videoI18n.assign()
        // console.log(newList)
        expect(newList.ja['test-scene-name_title']).exist
        expect(newList.ja['test-scene-name_btn_next_scene_name']).undefined
        expect(newList.ja['test-scene-name_btn_next_unit_name']).exist
        expect(newList.ja['test-scene-name_btn_end_unit_name']).exist
        expect(newList.en['test-scene-name_title']).exist
        expect(newList.en['test-scene-name_btn_next_scene_name']).exist
        expect(newList.en['test-scene-name_btn_next_unit_name']).exist
        expect(newList.en['test-scene-name_btn_end_unit_name']).exist

    })

    it('プロパティーが正しく追加で登録されているか', () => {

        const testFile = {
            'ja': {
                title: '日本語',
                video_url: 'test.com',
                btn_next_unit_name: '次のユニットへ',
                btn_end_unit_name: '最後のユニットへ'
            },
            'en': {
                title: 'english',
                video_url: 'test.com',
                btn_next_scene_name: 'next scene',
                btn_next_unit_name: 'next unit',
                btn_end_unit_name: 'last unit'
            }
        } as ConfigPerLocale

        const list = {
            ja: {
                'other-scene-name_some_val': '他のシーンのプロパティーです'
            },
            en: {
                'other-scene-name_some_val': 'other scene property'
            }
        } as I18nList

        const videoI18n = new VideoI18n(testFile, 'test-scene-name', list)
        const newList = videoI18n.assign()
        // console.log(newList)
        expect(newList.ja['other-scene-name_some_val']).exist
        expect(newList.en['other-scene-name_some_val']).exist
        expect(newList.ja['test-scene-name_title']).exist
        expect(newList.ja['test-scene-name_btn_next_scene_name']).undefined
        expect(newList.ja['test-scene-name_btn_next_unit_name']).exist
        expect(newList.ja['test-scene-name_btn_end_unit_name']).exist
        expect(newList.ja['test-scene-name_video_url']).exist
        expect(newList.en['test-scene-name_title']).exist
        expect(newList.en['test-scene-name_btn_next_scene_name']).exist
        expect(newList.en['test-scene-name_btn_next_unit_name']).exist
        expect(newList.en['test-scene-name_btn_end_unit_name']).exist
        expect(newList.en['test-scene-name_video_url']).exist

    })

})