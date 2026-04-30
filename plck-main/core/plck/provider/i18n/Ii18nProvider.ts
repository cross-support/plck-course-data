import {I18nList} from "../../i18n/l18n.type";

export interface Ii18nProvider {
    provide(list: I18nList): Promise<void>
}