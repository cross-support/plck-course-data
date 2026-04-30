import {IMainProvider} from "./IMainProvider";
import {Main} from "../../components/main/Main";
import IStorage from "../../storage/IStorage";
import {Frame} from "../../components/frame/frame/Frame.type";
import {PLCKConfigType} from "../../config/config.type";

export class MainProvider implements IMainProvider {

    private storage: IStorage

    constructor(storage: IStorage) {
        this.storage = storage
    }

    async provide(main: Main, frames: Frame[], plckConfig: PLCKConfigType): Promise<void> {
        const path = 'main.ts'
        const result = await main.create(frames, plckConfig)
        await this.storage.put(path, result)
    }

}