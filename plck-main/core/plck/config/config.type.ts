import type {ConfigPerLocale, LanguageLocale} from "../i18n/l18n.type";
import type {SceneType} from "../components/scene/Scene.type";

export type I18nConfig = {
    lang: LanguageLocale[]
}

export type FrameSetting = {
    main: { type: SceneType, name: string }
    sub?: { type: SceneType, name: string }
}

export type PLCKConfigType = {
    title: string
    scene_menu?: 'on' | 'off'
    complete_flg_scene?: number | string
    threshold_pc_smartphone?:  number | string
    display_complete_alert: 'on' | 'off'
    popup_explanation_text: string
    popup_next_unit_text: string
    popup_close_text: string
    multi_lang: 'on' | 'off'
    default_lang: LanguageLocale
    label_text: string
    frames: FrameSetting[]
    otherLocaleSettings?: ConfigPerLocale
} & I18nConfig
