import {LanguageLocale} from "../../../../i18n/l18n.type";


export type ChatConfig = {
    image: string
    textHtml: string
    right?: 'on' | 'off'
}

export type HtmlConfig = {
    title: string
    complete_on_scroll_end: 'on' | 'off'
    text?: {key: string}[]
    chat?: {
        [key in string]: ChatConfig[]
    }
}

export type HtmlConfigPerLocale = {
    [key in LanguageLocale]?: HtmlConfig
}
