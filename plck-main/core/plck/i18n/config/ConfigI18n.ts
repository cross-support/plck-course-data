import II18n from "../II18n";
import {PLCKConfigType} from "../../config/config.type";
import {ConfigPerLocale, I18nList, LanguageLocale} from "../l18n.type";
import {cloneDeep} from "lodash";

export default class ConfigI18n implements II18n {

    private targetProperties = [
        'title',
        'popup_explanation_text',
        'popup_next_unit_text',
        'popup_close_text',
        'label_text',
    ]

    private readonly config: PLCKConfigType
    private readonly list: I18nList

    constructor(config: PLCKConfigType, list: I18nList) {
        this.config = config
        this.list = list
    }


    assign(locale: LanguageLocale, targetObject: {}, list: I18nList): I18nList {

        const _list = cloneDeep(list)

        this.targetProperties.forEach(key => {

            const target = targetObject[key]

            if (target === undefined) {
                console.warn(`${key}のプロパティーが${locale}のロケールに設定されていません。plck.config.yamlもしくは、langディレクトリに設置しているファイルの設定をご確認ください。`)
                return
            }

            if (_list[locale] === undefined) {
                _list[locale] = {}
            }

            const keyName = `main_${key}`

            _list[locale][keyName] = target
        })

        return _list
    }

    generate(): I18nList {

        let _list: I18nList = cloneDeep(this.list)
        _list = this.assign(this.config.default_lang, this.config, _list) as I18nList


        // otherLocales
        if (this.config.multi_lang === 'on') {
            (Object.keys(this.config.otherLocaleSettings) as LanguageLocale[]).forEach((localeName) => {
                const localeObject = this.config.otherLocaleSettings[localeName]
                _list = this.assign(localeName, localeObject, _list)
            })
        }


        return _list
    }
}