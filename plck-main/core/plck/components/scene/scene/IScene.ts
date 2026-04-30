import {SceneComponent} from "../../common/common.type";
import {SceneType} from "../Scene.type";
import {ComponentName} from "../../common/ValueObject/ComponentName";
import {IComponentName} from "../../common/ValueObject/IComponentName";

export default interface IScene {
    name(): string,
    pathName(): string
    componentName(): IComponentName
    type(): SceneType,
    create(): Promise<SceneComponent>
}