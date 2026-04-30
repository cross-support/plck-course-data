import {SceneType} from "@corePlck/components/scene/Scene.type.ts";
import {PLCKConfig} from "@corePlck/config/PLCKConfig.ts";


export interface IScaffoldProvider {
    provide(type: SceneType, name: string, plckConfig: PLCKConfig, local: boolean): Promise<void>
}