import { describe, it, expect } from 'vitest'
import {FsStorage} from "../../../plck/storage/FsStorage.ts";
import path from 'node:path'
import {ViteConfigProvider} from "../../../vite/ViteConfigProvider.ts";

describe('ViteConfigProvider', () => {

    // eslint-disable-next-line no-undef
    const contentPath = path.resolve(`${__dirname}/contents`)
    const plckPath = path.resolve(`${__dirname}/provideTarget`)
    const vitePath = path.resolve(`${__dirname}/../../../vite`)
    const contentStorage = new FsStorage(contentPath)
    const plckStorage = new FsStorage(plckPath)
    const viteStorage = new FsStorage(vitePath)

    it('正しく各ユニットのconfigファイルが生成されるか確認', async () => {

        const provider = new ViteConfigProvider(contentStorage, plckStorage, viteStorage)
        await provider.provide()

        expect(await plckStorage.exists('vite.config.unitName.ts')).toBe(true)
        expect(await plckStorage.exists('vite.config.unitName2.ts')).toBe(true)
        expect(await plckStorage.exists('vite.config.unitName3.ts')).toBe(true)

        await plckStorage.remove('vite.config.unitName.ts')
        await plckStorage.remove('vite.config.unitName2.ts')
        await plckStorage.remove('vite.config.unitName3.ts')


    })


})
