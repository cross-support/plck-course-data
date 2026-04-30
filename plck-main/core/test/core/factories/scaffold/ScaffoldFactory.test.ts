import { expect, it, describe } from "vitest";
import {ScaffoldFactory} from "../../../../plck/factories/scaffold/ScaffoldFactory.ts";
import {FsStorage} from "../../../../plck/storage/FsStorage.ts";
import {VideoSceneScaffold} from "../../../../plck/components/scene/scaffold/video/VideoSceneScaffold.ts";
import path from 'node:path';

describe('ScaffoldFactory', () => {

    const basePath = path.resolve(`${__dirname}/../../../../plck/components/scene/scene`)
    const storage = new FsStorage(basePath)
    const factory = new ScaffoldFactory(storage)

    it('videoのscaffoldが正しく取得できること', async () => {

        const videoScaffold = factory.generate('video')
        expect(videoScaffold).toBeInstanceOf(VideoSceneScaffold)

    })

})