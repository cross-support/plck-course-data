export type LanguageLocale = 'ja' | 'vi' | 'en'

export type ConfigPerLocale = {
    [key in LanguageLocale]?: { [key: string]: any }
}

export type I18nList = {
    [key in LanguageLocale]?: {
        [key: string]: string
    }
}
