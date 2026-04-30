import {ISceneJS} from "../scene/js/ISceneJS";
import {ISceneStyle} from "../scene/style/ISceneStyle";
import {SceneType} from "../scene/Scene.type";
import {IComponentName} from "./ValueObject/IComponentName";

export type SceneComponent = {
    type: SceneType
    name: IComponentName
    componentString: string
    path: string
    js?: ISceneJS
    style?: ISceneStyle
}

