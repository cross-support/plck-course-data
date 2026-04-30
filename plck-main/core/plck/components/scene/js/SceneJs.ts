import IStorage from "../../../storage/IStorage";
import {ISceneJS} from "./ISceneJS";
import {SceneType} from "../Scene.type";

export class SceneJs implements ISceneJS {

    private storage: IStorage;
    private readonly type: SceneType;
    private readonly name: string;

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
        const local = await this.storage.exists(`${this.type}/${this.name}/customHook.js`)
        if (local) return `@scenes/${this.type}/${this.name}/customHook.js`
        const global = await this.storage.exists(`${this.type}/customHook.js`)
        if (global) return `@scenes/${this.type}/customHook.js`
        return ''
    }
}