import {LanguageLocale} from "../../../../i18n/l18n.type";
import {ButtonLabels} from "../common.type.ts";

export type SlideConfig = {
    title: string
    slide_speed: number
    img: string[]
} & ButtonLabels

export type SlideConfigPerLocale = {
    [key in LanguageLocale]?: SlideConfig
}