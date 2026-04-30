import { describe, it, expect } from "vitest";
import {MockStorage} from "../../../../plck/storage/MockStorage.ts";
import {MockScaffoldFactory} from "../../../../plck/factories/scaffold/MockScaffoldFactory.ts";
import {ScaffoldProvider} from "../../../../plck/provider/scaffold/ScaffoldProvider.ts";
import {MockPLCKConfig} from "../../../../plck/config/MockPLCKConfig.ts";


const plckConfigMultiLang = new MockPLCKConfig({
    multi_lang: 'on',
    default_lang: 'ja',
    lang: [ 'ja', 'en' ]
})

const factory = new MockScaffoldFactory({
    video: { js: 'video.js', config: 'video.config', css: 'video.css' },
    html: { js: 'html.js', config: 'html.config', css: 'html.css', html: 'html.html' },
    chat: { js: 'chat.js', config: 'chat.config', css: 'chat.css', html: 'chat.html' },
    slide: { js: 'slide.js', config: 'slide.config', css: 'slide.css' },
    quiz: { js: 'html.js', config: 'html.config', css: 'html.css' },
})

describe('ScaffoldFactory', () => {


    describe('各シーンの生成', () => {



        it('video', async () => {

            const storage = new MockStorage({})
            const provider = new ScaffoldProvider(factory, storage)
            await provider.provide('video', 'video-test', plckConfigMultiLang)
            // console.log(storage)
            expect(await storage.exists('video/video-test/config.ja.yaml')).toBe(true)
            expect(await storage.exists('video/video-test/config.en.yaml')).toBe(true)
            expect(await storage.exists('video/customHook.js')).toBe(true)
            expect(await storage.exists('video/style.css')).toBe(true)
            expect(await storage.exists('video/video-test/customHook.js')).toBe(false)
            expect(await storage.exists('video/video-test/style.css')).toBe(false)


        })

    })

    it('正しくグローバルに新しいファイルが生成されること', async () => {

        const storage = new MockStorage({})
        const provider = new ScaffoldProvider(factory, storage)
        await provider.provide('video', 'video-test', plckConfigMultiLang)
        // console.log(storage)
        expect(await storage.exists('video/video-test/config.ja.yaml')).toBe(true)
        expect(await storage.exists('video/video-test/config.en.yaml')).toBe(true)
        expect(await storage.exists('video/customHook.js')).toBe(true)
        expect(await storage.exists('video/style.css')).toBe(true)
        expect(await storage.exists('video/video-test/customHook.js')).toBe(false)
        expect(await storage.exists('video/video-test/style.css')).toBe(false)

    })

    it('グローバルにすでにファイルが存在する場合はファイルを作成しないこと', async () => {

        const storage = new MockStorage({
            'video/customHook.js': 'js already exists',
            'video/style.css': 'css already exists'
        })

        const provider = new ScaffoldProvider(factory, storage)
        await provider.provide('video', 'video-test', plckConfigMultiLang)

        expect(await storage.get('video/customHook.js')).toBe('js already exists')
        expect(await storage.get('video/style.css')).toBe('css already exists')

    })

    it('正しくローカルにファイルが作成されること', async () => {
        const storage = new MockStorage({})
        const provider = new ScaffoldProvider(factory, storage)
        await provider.provide('video', 'video-test', plckConfigMultiLang, true)
        // console.log(storage)
        expect(await storage.exists('video/video-test/config.ja.yaml')).toBe(true)
        expect(await storage.exists('video/video-test/config.en.yaml')).toBe(true)
        expect(await storage.exists('video/customHook.js')).toBe(true)
        expect(await storage.exists('video/style.css')).toBe(true)
        expect(await storage.exists('video/video-test/customHook.js')).toBe(true)
        expect(await storage.exists('video/video-test/style.css')).toBe(true)
    })

    it('同じ名前のシーンが存在する場合はエラーとなること', async () => {

        const storage = new MockStorage({
            'video/video-test': 'exists',
            'video/video-test/config.yaml': 'config.yaml',
        })

        const provider = new ScaffoldProvider(factory, storage)
        await expect(() => provider.provide('video', 'video-test', plckConfigMultiLang)).rejects.toThrowError()

    })


})