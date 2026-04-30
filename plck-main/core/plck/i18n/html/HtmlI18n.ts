import I18nMixin from "../I18nMixin";
import {I18nList, LanguageLocale} from "../l18n.type";
import {HtmlConfigPerLocale} from "../../components/scene/scene/html/html.type";
import {objectFlatter} from "../../../helper/objectFlatter.ts";

export default class HtmlI18n extends I18nMixin {

    targetProperties = [
        'title',
    ]

    generate(): I18nList {
        const list = this.assign()
        const config = this.sceneConfig as HtmlConfigPerLocale

        // textのプロパティーを追加
        (Object.keys(config) as LanguageLocale[]).forEach((locale: LanguageLocale) => {

            if (config[locale].text) {
                const textList = objectFlatter(config[locale].text, '')
                // console.log(textList)
                Object.keys(textList).forEach(key => {
                    this.add(locale, key, textList[key], list)
                })
            }

            if (config[locale].chat) {
                const chatList = objectFlatter(config[locale].chat, '')
                // console.log(chatList)
                Object.keys(chatList).forEach(key => {
                    this.add(locale, key, chatList[key], list)
                })
            }

        })



        return list
    }
}