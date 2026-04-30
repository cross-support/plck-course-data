import { expect, it, describe } from 'vitest'
import {VideoSceneScaffold} from "../../../../plck/components/scene/scaffold/video/VideoSceneScaffold.ts";
import {FsStorage} from "../../../../plck/storage/FsStorage.ts";
import path from "node:path";

describe('VideoSceneScaffold', () => {

    const basePath = path.resolve(`${__dirname}/../../../../plck/components/scene/scene`)
    const storage = new FsStorage(basePath)

    const scaffold = new VideoSceneScaffold(storage)

    it('ファイルが正しく取得できること', async () => {

        const scaffoldFiles = await scaffold.create()

        expect(!!scaffoldFiles.js).toBe(true)
        expect(!!scaffoldFiles.config).toBe(true)
        expect(!!scaffoldFiles.css).toBe(true)
        expect(!!scaffoldFiles.html).toBe(false)

    })

})