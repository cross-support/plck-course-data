import IScene from "./IScene";
import {SceneComponent} from "../../common/common.type";
import {SceneType} from "../Scene.type";
import {IComponentName} from "@corePlck/components/common/ValueObject/IComponentName.ts";

export class MockScene implements IScene {

    private sceneComponent: SceneComponent;
    private _name: string;

    constructor(sceneComponent: SceneComponent, name: string) {
        this.sceneComponent = sceneComponent
        this._name = name
    }

    componentName(): IComponentName {
        return this.sceneComponent.name
    }

    create(): Promise<SceneComponent> {
        return Promise.resolve(this.sceneComponent)
    }

    name(): string{
        return this._name
    }

    type(): SceneType {
        return this.sceneComponent.type
    }

    pathName(): string {
        return this.sceneComponent.path
    }

}