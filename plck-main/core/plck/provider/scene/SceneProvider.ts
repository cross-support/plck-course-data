import {ISceneProvider} from "./ISceneProvider";
import IStorage from "../../storage/IStorage";
import IScene from "../../components/scene/scene/IScene";

export class SceneProvider implements ISceneProvider {

    private storage: IStorage;

    constructor(storage: IStorage) {
        this.storage = storage
    }

    async provide(scene: IScene): Promise<void> {
        const path = `${scene.pathName()}`
        const sceneComponent = await scene.create()
        await this.storage.put(path, sceneComponent.componentString)
        return Promise.resolve()
    }


}