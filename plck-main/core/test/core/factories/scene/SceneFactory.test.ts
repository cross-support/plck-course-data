import { it, describe, expect } from 'vitest'
import {MockPLCKConfig} from "../../../../plck/config/MockPLCKConfig";
import {SceneFactory} from "../../../../plck/factories/scene/SceneFactory";
import {MockStorage} from "../../../../plck/storage/MockStorage";


describe('SceneFactory', () => {

    const plckConfig = new MockPLCKConfig({})

    const storage = new MockStorage({
        'video/video-test/customHook.js': "console.log('test')",
        'video/video-test/style.css': 'style.css',
        'video/video-test/config.ja.yaml': 'title: test-ja',
        'video/video-test/config.en.yaml': 'title: test-en'
    })

    const templateStorage = new MockStorage({
        'video/template.vue.ejs': "video template",
    })

    const factory = new SceneFactory(storage, templateStorage, plckConfig)

    it('ただしくファクトリーが動作すること: video', async () => {

        const result = await factory.generate('video', 'video-test')
        console.log(result)

    })

    it('存在しないシーンタイプが指定された時に正しくエラーとなること', async () => {

        expect(async () => await factory.generate('vivivi', 'video-test')).rejects.toThrowError('vivivi')

    })

})