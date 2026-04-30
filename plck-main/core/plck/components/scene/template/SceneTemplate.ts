import {ISceneTemplate} from "./ISceneTemplate";
import IStorage from "../../../storage/IStorage";
import {SceneType} from "../Scene.type";

export class SceneTemplate implements ISceneTemplate {
    
    private storage: IStorage;
    private type: SceneType;

    constructor(storage: IStorage, type: SceneType) {
        this.storage = storage
        this.type = type
    }
    
    load(): Promise<string> {
        return this.storage.get(`${this.type}/template.vue.ejs`)
    }
    
}