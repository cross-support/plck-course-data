import { describe, it, expect } from "vitest";
import {MockStorage} from "../../../../plck/storage/MockStorage";
import {I18nProvider} from "../../../../plck/provider/i18n/I18nProvider";
import {I18nList} from "../../../../plck/i18n/l18n.type";


describe('I18nProvider', () => {

    const storage = new MockStorage({})
    const provider = new I18nProvider(storage)
    const i8nList = {
        ja: { 'some': 'テスト' },
        en: { 'some': 'test' }
    } as I18nList

    it('I18nが正しく保存できること', async () => {

        await provider.provide(i8nList)
        const exists = await storage.exists(`i18n.js`)
        expect(exists).toBe(true)
        const result = await storage.get('i18n.js')
        // console.log(result)
        expect(!!result.match(/^export default/)).toBe(true)
        expect(!!result.match(/"some":"テスト"/)).toBe(true)
        expect(!!result.match(/"some":"test"/)).toBe(true)

    })

})
