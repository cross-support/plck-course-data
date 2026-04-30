import {SceneScaffoldMixin} from "../../../../components/scene/scaffold/SceneScaffoldMixin.ts";
import {SceneType} from "../../../../components/scene/Scene.type.ts";


export class ChatSceneScaffold extends SceneScaffoldMixin {
    protected targets: ('js'| 'html' | 'css' | 'config')[] = ['config', 'js', 'html']
    protected type: SceneType = 'chat'

    // javascriptのテンプレートは、htmlのものを参照する
    js() {
        return 'html/customHook.js'
    }
}