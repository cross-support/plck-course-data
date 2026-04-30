import { describe, it, expect } from "vitest";
import {MockScene} from "../../../../plck/components/scene/scene/MockScene";
import {Frame} from "../../../../plck/components/frame/frame/Frame.type";
import {SceneComponent} from "../../../../plck/components/common/common.type";
import {Main} from "../../../../plck/components/main/Main";
import {FsStorage} from "../../../../plck/storage/FsStorage";
import path from 'node:path'
import {MockComponentName} from "../../../../plck/components/common/ValueObject/MockComponentName";
import {MockPLCKConfig} from "../../../../plck/config/MockPLCKConfig";

describe('Main', () => {

    const mainPath = path.resolve(`${__dirname}/../../../../plck/components/main`)
    const mainStorage = new FsStorage(mainPath)
    const main = new Main(mainStorage)
    const plckConfig = new MockPLCKConfig({ default_lang: 'ja' })

    const testScene1 = new MockScene({
        type: 'video',
        name: new MockComponentName('VideoTestComponent1'),
        path: 'path/to/component/VideoTestComponent1.vue',
        componentString: 'componentString'
    }, 'video-test-component-1')

    const testScene2 = new MockScene({
        type: 'video',
        name: new MockComponentName('VideoTestComponent2'),
        path: 'path/to/component/VideoTestComponent2.vue',
        componentString: 'componentString'
    }, 'video-test-component-2')

    const testFrameComponent = {
        type: 'video',
        name: new MockComponentName('FrameVideoTest'),
        path: 'path/to/component/FrameVideoTest.vue',
        componentString: 'componentString'
    } as SceneComponent

    const testFrame = {
        main: { scene: testScene1, config: {} },
        sub: { scene: testScene2, config: {} },
        frameComponent: testFrameComponent
    } as Frame


    it('main.jsが正しく作成されること', async () => {

        const result = await main.create([ testFrame ], await plckConfig.load())
        // console.log(result)

        expect(result.match(/import VideoTestComponent1 from '@plck\/path\/to\/component\/VideoTestComponent1.vue'/))
        expect(result.match(/import VideoTestComponent2 from '@plck\/path\/to\/component\/VideoTestComponent2.vue'/))
        expect(result.match(/import FrameVideoTest from '@plck\/path\/to\/component\/FrameVideoTest.vue'/))

    })

})