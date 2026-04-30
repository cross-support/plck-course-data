import IScene from "../../components/scene/scene/IScene";

export interface ISceneProvider {
    provide(scene: IScene): Promise<void>
}