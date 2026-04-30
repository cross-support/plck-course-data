import {ISceneScaffold} from "@corePlck/components/scene/scaffold/ISceneScaffold.ts";
import {SceneType} from "@corePlck/components/scene/Scene.type.ts";

export interface IScaffoldFactory {
    generate(type: SceneType): ISceneScaffold
}