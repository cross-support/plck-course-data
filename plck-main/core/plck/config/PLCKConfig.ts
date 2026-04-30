import IStorage from "../storage/IStorage"
import {PLCKConfigType} from "./config.type"
import {IPLCKConfig} from "./IPLCKConfig";
import {ConfigPerLocale} from "../i18n/l18n.type";
const Yaml = require('js-yaml')

export class PLCKConfig implements IPLCKConfig {

    private storage: IStorage;

    constructor(storage: IStorage) {
        this.storage = storage
    }

    async load(): Promise<PLCKConfigType> {

        if (!await this.storage.exists('plck.config.yaml')) {
            throw new Error('plck.config.yamlが見つかりませんでした。')
        }

        const yaml = await this.storage.get('plck.config.yaml')
        // エラーハンドリングお願いします。
        // 回答：storageに関するエラーハンドリングについては、storage側がライブラリ（今回の場合だとおもにnode:fs）依存の詳細な例外を発生させるため、ここでエラーハンドリングをしてしまうと
        // 適切なエラーの処理が行われなくなる可能性がある+例外処理が複雑になるためstorageに関するエラーハンドリングは行っていません。
        // 上記踏まえ、この層ではplck.config.yamlが存在するかどうかだけで良いかと思いますので存在確認のみ追記しました。

        const plckPrimaryConfig = await Yaml.load(yaml) as PLCKConfigType

        if (!plckPrimaryConfig.lang) throw new Error('plck.config.yamlのlang属性が指定されていません。言語が一つであっても必ず一つ指定してください')

        if (plckPrimaryConfig.multi_lang === 'on') {
            const langListWithoutPrimary = plckPrimaryConfig.lang.filter((_lang) => _lang !== plckPrimaryConfig.default_lang)
            if (!langListWithoutPrimary.length) throw new Error('plck.config.yamlのmulti_langがonになっていますが、複数の言語が指定されていません。複数言語を扱わない場合はmulti_langをoffに設定してください')

            const plckConfigPerOtherLocale = {}

            for (let i = 0; i < langListWithoutPrimary.length; i++) {
                const targetLang = langListWithoutPrimary[i]
                const targetYaml = await this.storage.get(`lang/${targetLang}.yaml`)
                if (!targetYaml) throw new Error(`${targetLang}.yamlがlangフォルダに設置されていません。`)
                plckConfigPerOtherLocale[targetLang] = await Yaml.load(targetYaml)
            }

            plckPrimaryConfig.otherLocaleSettings = plckConfigPerOtherLocale as ConfigPerLocale
        }

        return plckPrimaryConfig
    }



}