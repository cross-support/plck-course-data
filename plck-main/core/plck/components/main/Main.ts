import {IMain} from "./IMain";
import {Frame} from "../frame/frame/Frame.type";
import IStorage from "../../storage/IStorage";
import TemplateEjsResolver from "../common/TemplateResolver/TemplateEjsResolver";
import {PLCKConfigType} from "../../config/config.type";

export class Main implements IMain {

    private storage: IStorage;

    constructor(storage: IStorage) {
        this.storage = storage
    }

    async create(frames: Frame[], plckConfig: PLCKConfigType): Promise<string> {

        const mainPath = `main.ts.ejs`
        const template = await this.storage.get(mainPath)
        const resolver = new TemplateEjsResolver(template, { frames, config: plckConfig, env: process.env.NODE_ENV })

        return await resolver.create()
    }

}