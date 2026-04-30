import { describe, it, expect } from "vitest";
import {MockStorage} from "../../../../plck/storage/MockStorage";
import {MainProvider} from "../../../../plck/provider/main/MainProvider";
import {Main} from "../../../../plck/components/main/Main";
import {Frame} from "../../../../plck/components/frame/frame/Frame.type";
import {PLCKConfigType} from "../../../../plck/config/config.type.ts";


describe('MainProvider', () => {

    const storage = new MockStorage({})
    const mainStorage = new MockStorage({
        'main.ts.ejs': 'test'
    })
    const frames = [{} as Frame]
    const provider = new MainProvider(storage)
    const main = new Main(mainStorage)

    it('Mainが正しく保存できること', async () => {

        await provider.provide(main, frames, {} as PLCKConfigType)

        const exists = await storage.exists(`main.ts`)
        expect(exists).toBe(true)
        const result = await storage.get('main.ts')
        // console.log(result)
        expect(!!result.match(/^test/)).toBe(true)

    })

})
