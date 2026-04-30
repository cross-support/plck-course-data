import {SceneScaffoldMixin} from "../../../../components/scene/scaffold/SceneScaffoldMixin.ts";
import {SceneType} from "../../../../components/scene/Scene.type.ts";


export class HtmlSceneScaffold extends SceneScaffoldMixin {
    protected targets: ('js'| 'html' | 'css' | 'config')[] = ['config', 'js', 'html']
    protected type: SceneType = 'html'
}