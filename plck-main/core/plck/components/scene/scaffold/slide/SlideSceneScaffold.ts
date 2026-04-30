import {SceneScaffoldMixin} from "../../../../components/scene/scaffold/SceneScaffoldMixin.ts";
import {SceneType} from "../../../../components/scene/Scene.type.ts";


export class SlideSceneScaffold extends SceneScaffoldMixin {
    protected targets: ('js'| 'html' | 'css' | 'config')[] = ['config', 'css', 'js']
    protected type: SceneType = 'slide'
}