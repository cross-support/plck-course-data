import {toCamelCase} from "../../../../helper/toCamelCase";
import {IComponentName} from "./IComponentName";
import {SceneType} from "@corePlck/components/scene/Scene.type.ts";

export class ComponentName implements IComponentName {

    private readonly type: string
    private readonly name: string

    constructor(type: SceneType, name: string) {
        // 取りうる具体的な文字列まで見通せるのであれば、このクラスでバリエーションしたほうがvalue objectの良さを出せると思うのですが、いかがでしょうか。
        // 回答: nameについては、ユーザー任意の文字列が含まれるので文字列列挙型で型指定が難しいのと、typeについてはSceneTypeが入力される前提となるため
        this.type = type;
        this.name = name;

    }

    public value() {
        return `${toCamelCase(this.type)}${toCamelCase(this.name)}`
    }
}