import { describe, it, expect } from "vitest";
import {FrameProvider} from "../../../../plck/provider/frame/FrameProvider";
import {MockStorage} from "../../../../plck/storage/MockStorage";
import {Frame} from "../../../../plck/components/frame/frame/Frame.type";
import {MockScene} from "../../../../plck/components/scene/scene/MockScene";


describe('FrameProvider', () => {

    const storage = new MockStorage({})
    const frameProvider = new FrameProvider(storage)

    const frame = {
        scene: new MockScene({
            componentString: 'scene-component',
            path: 'video/Video1.vue',
            name: 'Video1'
        }),
        subScene: new MockScene({
            componentString: 'sub-scene-component',
            path: 'video/Video2.vue',
            name: 'Video2'
        }),
        frameComponent: {
            componentString: 'frame-component',
            path: 'frame/TestFrame.vue',
            name: 'TestFrame'
        }
    } as Frame

    it('Frameが正しく保存できること', async () => {

        await frameProvider.provide(frame)
        const exists = await storage.exists(`frame/TestFrame.vue`)
        expect(exists).toBe(true)
        const result = await storage.get('frame/TestFrame.vue')
        expect(result).toBe('frame-component')

    })

})