import { it, describe, expect } from 'vitest'
import {FsStorage} from "../../../../../plck/storage/FsStorage";
import path from 'node:path'
import {SceneStyle} from "../../../../../plck/components/scene/style/SceneStyle";

describe('SceneCss', () => {


    it('Globalにしかファイルがない場合に、GlobalのSceneStyleが正しく取得できること', async () => {

        // eslint-disable-next-line no-undef
        const basePath = path.resolve(`${__dirname}/scene-css-test/global-test`)
        const storage = new FsStorage(basePath)
        const sceneJs = new SceneStyle('video', 'local-directory', storage)

        const result = await sceneJs.load()

        // console.log({ result })

        expect(!!result.match(/\.global/)).toBe(true)


    })

    it('Localにファイルがある場合に、LocalのSceneStyleが正しく取得できること', async () => {

        // eslint-disable-next-line no-undef
        const basePath = path.resolve(`${__dirname}/scene-css-test/local-test`)
        const storage = new FsStorage(basePath)
        const sceneJs = new SceneStyle('video', 'local-directory', storage)

        const result = await sceneJs.load()

        // console.log({ result })

        expect(!!result.match(/\.local/)).toBe(true)


    })

})