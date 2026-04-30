import {I18nList, LanguageLocale, ConfigPerLocale} from "./l18n.type";
import {cloneDeep} from 'lodash'
import II18n from "./II18n";

export default class I18nMixin implements II18n {

    sceneName: string
    list: I18nList
    sceneConfig: ConfigPerLocale
    targetProperties: string[]
    titleProperty: string = 'title'

    /**
     *
     * @param config
     * @param sceneName
     * @param list
     */
    constructor(
        config: ConfigPerLocale,
        sceneName: string,
        list: I18nList
    ) {
        this.sceneConfig = config
        this.sceneName = sceneName
        this.list = list
    }


    add(localeName: LanguageLocale, key: string, value: string, list: I18nList): void {
        if (list[localeName] === undefined) {
            list[localeName] = {}
        }
        const keyName = `${this.sceneName}_${key}`
        list[localeName][keyName] = value
    }

    assign(): I18nList {

        const _list = cloneDeep(this.list)

        this.targetProperties.forEach((key: string) => {

            (Object.keys(this.sceneConfig) as LanguageLocale[]).forEach((localeName: LanguageLocale) => {
                const target = this.sceneConfig[localeName][key]

                if (target === undefined) {
                    console.warn(`${key}のプロパティーが${localeName}のロケールに設定されていません。設定ファイルをご確認ください。`)
                    return
                }

                this.add(localeName, key, target, _list)

                if (key === this.titleProperty) {
                    _list[localeName][`title.${this.sceneName}`] = target
                }

            })

        })


        return _list
    }

    generate(): I18nList {
        return this.assign();
    }
}