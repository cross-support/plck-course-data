import IStorage from "../../../storage/IStorage";
import {ISceneHtml} from "./ISceneHtml";
import {SceneType} from "../Scene.type";

export class SceneHtml implements ISceneHtml {

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
        const local = await this.storage.get(`${this.type}/${this.name}/html.vue`)
        if (local) return local
        return ''
    }
}