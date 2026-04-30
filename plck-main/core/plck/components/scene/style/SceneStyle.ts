import {ISceneStyle} from "./ISceneStyle";
import IStorage from "../../../storage/IStorage";
import {SceneType} from "../Scene.type";

export class SceneStyle implements ISceneStyle {

    private storage: IStorage;
    private type: SceneType;
    private name: string;

    constructor(
        type: SceneType,
        name: string,
        storage: IStorage,
    ) {
        this.type = type
        this.name = name
        this.storage = storage
    }

    async load(): Promise<string> {
        const local = await this.storage.get(`${this.type}/${this.name}/style.css`)
        if (local) return local
        const global = await this.storage.get(`${this.type}/style.css`)
        // console.log("global----------------------", global)
        if (global) return global
        return ''
    }
}