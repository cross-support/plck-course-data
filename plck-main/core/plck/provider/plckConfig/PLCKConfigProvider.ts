import {IPLCKConfigProvider} from "./IPLCKConfigProvider";
import IStorage from "../../storage/IStorage";
import {IPLCKConfig} from "../../config/IPLCKConfig";

export class PLCKConfigProvider implements IPLCKConfigProvider {

    private storage: IStorage;

    constructor(storage: IStorage) {
        this.storage = storage
    }

    async provide(plckConfig: IPLCKConfig): Promise<void> {
        const config = await plckConfig.load()
        const text = `
import type { PLCKConfigType } from "@corePlck/config/config.type"
const plckConfig: PLCKConfigType = ${JSON.stringify(config)}
export default plckConfig`
        await this.storage.put('plckConfig.ts', text)
        return Promise.resolve();
    }

}