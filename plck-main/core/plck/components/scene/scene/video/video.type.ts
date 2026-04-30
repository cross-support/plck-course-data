import {LanguageLocale} from "../../../../i18n/l18n.type";
import {ButtonLabels} from "../common.type.ts";

export type VideoConfig = {
    title: string
    video_url: string
    complete_end_video: 'on' | 'off'
} & ButtonLabels

export type VideoConfigPerLocale = {
    [key in LanguageLocale]?: VideoConfig
}