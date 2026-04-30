import IScene from "../IScene.ts";
import type {SceneType} from "../../../scene/Scene.type.ts";
import {HtmlScene} from "../html/HtmlScene.ts";


export class ChatScene extends HtmlScene implements IScene {

    type(): SceneType {
        return 'chat'
    }

    pathName(): string {
        return `chat/${this._componentName.value()}.vue`;
    }

}