import {II18nFactory} from "./II18nFactory";
import VideoI18n from "../../i18n/video/VideoI18n";
import {SceneType} from "../../components/scene/Scene.type";
import II18n from "../../i18n/II18n";
import {I18nList} from "../../i18n/l18n.type";
import ConfigI18n from "../../i18n/config/ConfigI18n";
import HtmlI18n from "../../i18n/html/HtmlI18n";
import QuizI18n from "../../i18n/quiz/QuizI18n.ts";
import SlideI18n from "../../i18n/slide/SlideI18n.ts";

export class I18nFactory implements II18nFactory {

    generate(type: SceneType, config: any, sceneName: string, list: I18nList): II18n {
        switch (type) {
            case "config":
                return new ConfigI18n(config, list)
            case "video":
                return new VideoI18n(config, sceneName, list)
            case "html":
            case "chat":
                return new HtmlI18n(config, sceneName, list)
            case "quiz":
                return new QuizI18n(config, sceneName, list)
            case "slide":
                return new SlideI18n(config, sceneName, list)
        }

        throw new Error(`i18nエラー: ${type}はシーンの名前として適切ではありません`)
    }

}