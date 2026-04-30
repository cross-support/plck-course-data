import {ScaffoldFiles} from "../Scene.type";

/**
 * シーンごとの元となるファイル群を作成する
 */
export interface ISceneScaffold {
    create(): Promise<ScaffoldFiles>
}