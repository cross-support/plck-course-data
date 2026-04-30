import {IScaffoldProvider} from "@corePlck/provider/scaffold/IScaffoldProvider.ts";
import {IScaffoldFactory} from "@corePlck/factories/scaffold/IScaffoldFactory.ts";
import {SceneType} from "@corePlck/components/scene/Scene.type.ts";
import IStorage from "@corePlck/storage/IStorage.ts";
import {PLCKConfig} from "@corePlck/config/PLCKConfig.ts";


export class ScaffoldProvider implements IScaffoldProvider {

    private factory: IScaffoldFactory
    private storage: IStorage

    constructor(factory: IScaffoldFactory, storage: IStorage) {
        this.factory = factory
        this.storage = storage
    }

    async provide(type: SceneType, name: string, plckConfig: PLCKConfig, local: boolean = false): Promise<void> {

        const scaffold = this.factory.generate(type)
        const scaffoldFiles = await scaffold.create()
        const config = await plckConfig.load()

        const globalTarget = `${type}`
        const localTarget = `${type}/${name}`

        if (!config.default_lang) {
            throw new Error('plck.config.yamlのdefault_langが指定されていません。')
        }
        // nameの重複チェック
        if (await this.storage.exists(`${localTarget}`)) {
            throw new Error(`${type}タイプの${name}という名前のシーンはすでに存在します。別の名前を指定してください`)
        }

        // configを言語分追加
        if (config.multi_lang === 'on') {
            for(let i = 0; i < config.lang.length; i++) {
                const targetLang = config.lang[i]
                await this.storage.put(`${localTarget}/config.${targetLang}.yaml`, scaffoldFiles.config)
            }
        } else {
            await this.storage.put(`${localTarget}/config.${config.default_lang}.yaml`, scaffoldFiles.config)
        }

        // すでにglobalにcustomHook.jsがあればスキップ
        // なければ作成
        const hasCustomHookInGlobal = await this.storage.exists(`${globalTarget}/customHook.js`)

        if (!hasCustomHookInGlobal && scaffoldFiles.js) {
            await this.storage.put(`${globalTarget}/customHook.js`, scaffoldFiles.js)
        }

        // ローカルオプションがついていればローカルに作成
        if (local && scaffoldFiles.js) {
            await this.storage.put(`${localTarget}/customHook.js`, scaffoldFiles.js)
        }

        // htmlファイルの作成
        if (scaffoldFiles.html) {
            await this.storage.put(`${localTarget}/html.vue`, scaffoldFiles.html)
        }

        // cssファイルの作成
        const hasCSSInGlobal = await this.storage.exists(`${globalTarget}/style.css`)
        if (!hasCSSInGlobal && scaffoldFiles.css) {
            await this.storage.put(`${globalTarget}/style.css`, scaffoldFiles.css)
        }

        // ローカルオプションがついていればローカルに作成
        if (local && scaffoldFiles.css) {
            await this.storage.put(`${localTarget}/style.css`, scaffoldFiles.css)
        }

    }
}