import { describe, it, expect } from "vitest";
import {MockStorage} from "../../../../plck/storage/MockStorage";
import {MockScene} from "../../../../plck/components/scene/scene/MockScene";
import {SceneProvider} from "../../../../plck/provider/scene/SceneProvider";


describe('SceneProvider', () => {

    const storage = new MockStorage({})
    const provider = new SceneProvider(storage)
    const scene = new MockScene({
        componentString: 'scene-component',
        path: 'video/Video1.vue',
        name: 'Video1'
    })

    it('Sceneが正しく保存できること', async () => {

        await provider.provide(scene)
        const exists = await storage.exists(`video/Video1.vue`)
        expect(exists).toBe(true)
        const result = await storage.get('video/Video1.vue')
        expect(result).toBe('scene-component')

    })

})
