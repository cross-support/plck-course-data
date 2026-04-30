import {SceneScaffoldMixin} from "../../../../components/scene/scaffold/SceneScaffoldMixin.ts";
import {SceneType} from "../../../../components/scene/Scene.type.ts";


export class QuizSceneScaffold extends SceneScaffoldMixin {
    protected targets: ('js' | 'css' | 'config')[] = ['config', 'js', 'css']
    protected type: SceneType = 'quiz'
}