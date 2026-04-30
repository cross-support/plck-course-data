import { it, describe, expect } from 'vitest'
import {SceneJs} from "../../../../../plck/components/scene/js/SceneJs";
import {FsStorage} from "../../../../../plck/storage/FsStorage";
import path from 'node:path'

describe('SceneJs', () => {

    it('Globalにしかファイルがない場合に、GlobalのSceneJsが正しく取得できること', async () => {

        // eslint-disable-next-line no-undef
        const basePath = path.resolve(`${__dirname}/scene-js-test/global-test`)
        const storage = new FsStorage(basePath)
        const sceneJs = new SceneJs('video', 'local-directory', storage)

        const result = await sceneJs.load()

        // console.log({ result })

        expect(!!result.match(/@scenes\/video\/customHook.js/)).toBe(true)


    })

    it('Localにファイルがある場合に、LocalのSceneJsが正しく取得できること', async () => {

        // eslint-disable-next-line no-undef
        const basePath = path.resolve(`${__dirname}/scene-js-test/local-test`)
        const storage = new FsStorage(basePath)
        const sceneJs = new SceneJs('video', 'local-directory', storage)
        const result = await sceneJs.load()

        // console.log({ result })

        expect(!!result.match(/@scenes\/video\/local-directory\/customHook.js/)).toBe(true)


    })

})