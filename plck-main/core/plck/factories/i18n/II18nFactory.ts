import {SceneType} from "../../components/scene/Scene.type";
import II18n from "../../i18n/II18n";
import {I18nList} from "../../i18n/l18n.type";

export interface II18nFactory {
    generate(type: SceneType, config: any, sceneName: string, list: I18nList): II18n
}