import { it, describe, expect } from 'vitest'
import {FsStorage} from "../../../../../plck/storage/FsStorage";
import path from 'node:path'
import {SceneConfig} from "../../../../../plck/components/scene/config/SceneConfig";

describe('SceneConfig', () => {

    it('configファイルが正しく読み込まれていること', async () => {

        // eslint-disable-next-line no-undef
        const basePath = path.resolve(`${__dirname}/scene-config-test`)
        const storage = new FsStorage(basePath)
        const sceneJs = new SceneConfig('video', 'local-directory', storage)

        const result = await sceneJs.load()

        // console.log({ result })

        expect(result.ja).exist
        expect(result.en).exist


    })

})