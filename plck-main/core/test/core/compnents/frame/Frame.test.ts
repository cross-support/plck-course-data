import { describe, it, expect } from "vitest";
import {Frame} from "../../../../plck/components/frame/frame/Frame";
import {FsStorage} from "../../../../plck/storage/FsStorage";
import path from 'node:path'
import {SceneFactory} from "../../../../plck/factories/scene/SceneFactory";
import {MockStorage} from "../../../../plck/storage/MockStorage";
import {MockPLCKConfig} from "../../../../plck/config/MockPLCKConfig";
import {FrameSetting} from "../../../../plck/config/config.type";

describe('Frame', () => {

    const basePath = path.resolve(`${__dirname}/../../../../plck/components/frame`)

    const frameStorage = new FsStorage(basePath)

    const templateStorage = new MockStorage({
        'video/template.vue.ejs': 'template',
    })

    const sceneStorage = new MockStorage({
        'video/video-test1/config.ja.yaml': "title: タイトル",
        'video/video-test1/config.en.yaml': "title: this is title",
        'video/style.css': "style.css",
        'video/customHook.js': "customHook.js",
        'video/video-test2/config.ja.yaml': "title: タイトル",
        'video/video-test2/config.en.yaml': "title: this is title",
    })

    const plckConfig = new MockPLCKConfig({})
    const factory = new SceneFactory(sceneStorage, templateStorage, plckConfig)
    const frame = new Frame(frameStorage, factory)


    it('Frameが正しく作成されること: シーンが一つだけの場合', async () => {

        const frameSetting: FrameSetting = {
            main: { type: 'video', name: 'video-test1' }
        }

        const frameResult = await frame.create(frameSetting)

        // console.log({ frameResult })
        expect(frameResult.main).exist
        expect(frameResult.sub).undefined

    })

    it('Frameが正しく作成されること: シーンが2つある場合', async () => {

        const frameSetting: FrameSetting = {
            main: { type: 'video', name: 'video-test1' },
            sub: { type: 'video', name: 'video-test2' }
        }

        const frameResult = await frame.create(frameSetting)

        // console.log({ frameResult })
        expect(frameResult.main).exist
        expect(frameResult.sub).exist

    })

})