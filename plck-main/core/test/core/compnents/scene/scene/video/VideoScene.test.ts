import { it, describe, expect } from 'vitest'
import {MockSceneJs} from "../../../../../../plck/components/scene/js/MockSceneJs";
import {MockSceneStyle} from "../../../../../../plck/components/scene/style/MockSceneStyle";
import {VideoConfig, VideoConfigPerLocale} from "../../../../../../plck/components/scene/scene/video/video.type";
import {LanguageLocale} from "../../../../../../plck/i18n/l18n.type";
import {MockSceneConfig} from "../../../../../../plck/components/scene/config/MockSceneConfig";
import {MockPLCKConfig} from "../../../../../../plck/config/MockPLCKConfig";
import VideoScene from "../../../../../../plck/components/scene/scene/video/VideoScene";
import {SceneTemplate} from "../../../../../../plck/components/scene/template/SceneTemplate";
import {FsStorage} from "../../../../../../plck/storage/FsStorage";
import path from 'node:path'

describe('VideoScene', () => {

    const jaConfig: VideoConfig = {
        title: 'タイトル',
        btn_end_unit_name: '最後のユニットへ',
        btn_next_scene_name: '次のシーンへ',
        btn_next_unit_name: '次のユニットへ',
        video_url: 'url.com',
        complete_end_video: 'on'
    }

    const enConfig: VideoConfig = {
        title: 'title',
        btn_end_unit_name: 'last unit',
        btn_next_scene_name: 'next scene',
        btn_next_unit_name: 'next unit',
        video_url: 'url.com',
        complete_end_video: 'on'
    }

    const templateStorage = new FsStorage(path.resolve(`${__dirname}/../../../../../../plck/components/scene/scene`))

    it('SceneComponentが正しく作成できること', async () => {

        const name = 'test-component'
        const sceneJs = new MockSceneJs(`export true`)
        const sceneStyle = new MockSceneStyle(`.test { display: none }`)
        const config: { [key in LanguageLocale]?: any } = {
            ja: jaConfig,
            en: enConfig,
        }
        const sceneConfig = new MockSceneConfig(config)
        const configPerLocale = await sceneConfig.load() as VideoConfigPerLocale

        const pConfig = {
            default_lang: 'ja'
        }
        const plckConfig = new MockPLCKConfig(pConfig)
        const template = new SceneTemplate(templateStorage, 'video')

        const video = new VideoScene(name, plckConfig, configPerLocale, sceneJs, sceneStyle, template)


        const result = await video.create()

        // console.log(result)

        expect(result.type).toBe('video')
        expect(result.name.value()).toBe('VideoTestComponent')
        expect(result.path).toBe('video/VideoTestComponent.vue')
        expect(await result.js.load()).toBe('export true')
        expect(await result.style.load()).toBe('.test { display: none }')
        expect(result.componentString).exist

    })

})