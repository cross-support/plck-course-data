import { describe, it, expect } from "vitest";
import {I18nFactory} from "../../../../plck/factories/i18n/I18nFactory";
import {VideoConfig} from "../../../../plck/components/scene/scene/video/video.type";

describe('I18nFactory', () => {


    const i18nFactory = new I18nFactory()

    it('言語設定のファクトリーが正しく動作すること: video', async () => {

        const videoConfig = {
            ja: {
                title: 'タイトルです',
                video_url: 'test.com',
                complete_end_video: 'on',
                btn_next_unit_name: '次のユニットへ',
                btn_next_scene_name: '次のシーンへ',
                btn_end_unit_name: '最後のユニットへ'
            } as VideoConfig,
            en: {
                title: 'this is title',
                video_url: 'test.en.com',
                btn_next_unit_name: 'next unit.',
                btn_next_scene_name: 'next scene.',
                btn_end_unit_name: 'end of unit.'
            } as VideoConfig
        }

        const result = i18nFactory.generate('video', videoConfig, 'video-test', {})

        const i18nList = await result.generate()

        expect(i18nList.ja['video-test_title']).toBe('タイトルです')
        expect(i18nList.en['video-test_title']).toBe('this is title')


    })

    it('存在しないシーンタイプが指定された場合に、言語設定のファクトリーがエラーとなること', async () => {
        expect(async () => await i18nFactory.generate('vivivi', {}, 'video-test', {})).rejects.toThrowError('vivivi')
    })

})