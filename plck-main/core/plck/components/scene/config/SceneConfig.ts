import IStorage from "../../../storage/IStorage"
import {ISceneConfig} from "./ISceneConfig"
import {SceneType} from "../Scene.type"
import {ConfigPerLocale} from "../../../i18n/l18n.type";
const Yaml = require('js-yaml')

/**
 * ストレージからYamlファイルを取得し、コンフィグファイルを作成する
 */
export class SceneConfig implements ISceneConfig {

    private storage: IStorage;
    private readonly type: SceneType;
    private readonly name: string;

    constructor(
        type: SceneType,
        name: string,
        storage: IStorage,
    ) {
        this.type = type
        this.name = name
        this.storage = storage
    }

    async load(): Promise<ConfigPerLocale> {
        const result = {}
        const yamls = await this.storage.getAll(`${this.type}/${this.name}/config.*.yaml`)

        const configFileNames = Object.keys(yamls)
        for (let i = 0; i < configFileNames.length; i++) {
            const fileName = configFileNames[i]
            const yaml = yamls[fileName]
            const locale = fileName.replace(/config\.(.*)\.yaml/, '$1')
            const content = await Yaml.load(yaml)
            result[locale] = content
        }

        return result as ConfigPerLocale
    }
}