import {Ii18nProvider} from "./Ii18nProvider";
import {I18nList} from "../../i18n/l18n.type";
import IStorage from "../../storage/IStorage";

export class I18nProvider implements Ii18nProvider {

    private storage: IStorage;

    constructor(storage: IStorage) {
        this.storage = storage
    }

    async provide(list: I18nList): Promise<void> {
        const text = `export default ${JSON.stringify(list)}`
        await this.storage.put('i18n.js', text)
        return Promise.resolve()
    }

}