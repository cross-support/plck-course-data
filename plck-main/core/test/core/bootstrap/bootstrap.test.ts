import { describe, it, expect } from "vitest";
import path from 'node:path'
import bootstrap from "../../../bootstrap";
import {FsStorage} from "../../../plck/storage/FsStorage.ts";

describe('bootstrap', () => {

    const unitName = 'test-unit'
    const configPath = path.resolve(`${__dirname}/testRoot`)
    const unitPath = path.resolve(configPath + '/units')
    const plckPath = `${configPath}/plckResult`
    const scenePath = `${configPath}/scenes`
    const plckStorage = new FsStorage(plckPath)

    it('bootstrapが正しく動作すること', async () => {

        const plck = bootstrap(
            unitName,
            unitPath,
            plckPath,
            scenePath
        )

        // console.log(plck)

        await plck.init()

        expect(await plckStorage.exists('test-unit/main.ts')).toBe(true)
        expect(await plckStorage.exists('test-unit/i18n.js')).toBe(true)
        expect(await plckStorage.exists('test-unit/repository.ts')).toBe(true)
        expect(await plckStorage.exists('test-unit/frame')).toBe(true)
        expect(await plckStorage.exists('test-unit/video')).toBe(true)

    })
})
