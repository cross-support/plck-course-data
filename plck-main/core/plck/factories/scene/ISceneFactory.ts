import IScene from "../../components/scene/scene/IScene";
import {SceneType} from "../../components/scene/Scene.type";

export interface ISceneFactory {
    generate(type: SceneType, name: string): Promise<{ scene: IScene, config: any }>
}