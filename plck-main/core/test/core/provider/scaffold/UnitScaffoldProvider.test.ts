import { describe, it, expect } from "vitest";
import {MockStorage} from "../../../../plck/storage/MockStorage.ts";
import {PLCKConfigType} from "../../../../plck/config/config.type.ts";
import {UnitScaffoldProvider} from "../../../../plck/provider/scaffold/UnitScaffoldProvider.ts";


describe('UnitScaffoldFactory', () => {


    describe('plck.config.yamlの生成', () => {


        it('multi_lang が off （他言語がない）の時', async () => {

            const storage = new MockStorage({})

            const plckConfig: PLCKConfigType = {
                title: "title",
                scene_menu: 'on',
                display_complete_alert: 'off',
                popup_explanation_text: 'popup_explanation_text',
                popup_next_unit_text: 'popup_next_unit_text',
                popup_close_text: 'popup_close_text',
                default_lang: 'ja',
                multi_lang: "off",
                label_text: 'label_text',
                frames: [],
                lang: []
            }


            const provider = new UnitScaffoldProvider(storage)

            await provider.provide('test-unit', plckConfig)

            expect(await storage.exists('/test-unit/plck.config.yaml')).toBe(true)
            const result = await storage.get('/test-unit/plck.config.yaml')
            // console.log(result)
            expect(!!result.match(/title:/)).toBe(true)
            expect(!!result.match(/scene_menu:/)).toBe(true)
            expect(!!result.match(/display_complete_alert:/)).toBe(true)
            expect(!!result.match(/popup_explanation_text:/)).toBe(true)
            expect(!!result.match(/popup_next_unit_text:/)).toBe(true)
            expect(!!result.match(/popup_close_text:/)).toBe(true)
            expect(!!result.match(/default_lang:/)).toBe(true)
            expect(!!result.match(/label_text:/)).toBe(true)
            expect(!!result.match(/frames:/)).toBe(true)
            expect(!!result.match(/lang:/)).toBe(true)

        })

        it('multi_lang が on （他言語がある）の時', async () => {

            const storage = new MockStorage({})

            const plckConfig: PLCKConfigType = {
                title: "title",
                scene_menu: 'on',
                display_complete_alert: 'off',
                popup_explanation_text: 'popup_explanation_text',
                popup_next_unit_text: 'popup_next_unit_text',
                popup_close_text: 'popup_close_text',
                default_lang: 'ja',
                multi_lang: "on",
                label_text: 'label_text',
                frames: [],
                lang: ['vi', 'en']
            }


            const provider = new UnitScaffoldProvider(storage)
            await provider.provide('test-unit', plckConfig)

            expect(await storage.exists('/test-unit/lang/vi.yaml')).toBe(true)
            expect(await storage.exists('/test-unit/lang/en.yaml')).toBe(true)

            const resultVi = await storage.get('/test-unit/lang/vi.yaml')
            const resultEn = await storage.get('/test-unit/lang/en.yaml')


            expect(!!resultVi.match(/title:/)).toBe(true)
            expect(!!resultVi.match(/scene_menu:/)).toBe(false)
            expect(!!resultVi.match(/display_complete_alert:/)).toBe(false)
            expect(!!resultVi.match(/popup_explanation_text:/)).toBe(true)
            expect(!!resultVi.match(/popup_next_unit_text:/)).toBe(true)
            expect(!!resultVi.match(/popup_close_text:/)).toBe(true)
            expect(!!resultVi.match(/default_lang:/)).toBe(false)
            expect(!!resultVi.match(/label_text:/)).toBe(true)
            expect(!!resultVi.match(/frames:/)).toBe(false)
            expect(!!resultVi.match(/lang:/)).toBe(false)

            expect(!!resultEn.match(/title:/)).toBe(true)
            expect(!!resultEn.match(/scene_menu:/)).toBe(false)
            expect(!!resultEn.match(/display_complete_alert:/)).toBe(false)
            expect(!!resultEn.match(/popup_explanation_text:/)).toBe(true)
            expect(!!resultEn.match(/popup_next_unit_text:/)).toBe(true)
            expect(!!resultEn.match(/popup_close_text:/)).toBe(true)
            expect(!!resultEn.match(/default_lang:/)).toBe(false)
            expect(!!resultEn.match(/label_text:/)).toBe(true)
            expect(!!resultEn.match(/frames:/)).toBe(false)
            expect(!!resultEn.match(/lang:/)).toBe(false)

            // console.log(storage)

        })

    })


})
