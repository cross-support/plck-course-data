import {IScaffoldFactory} from "../../factories/scaffold/IScaffoldFactory.ts";
import {SceneType} from "../../components/scene/Scene.type.ts";
import {VideoSceneScaffold} from "../../components/scene/scaffold/video/VideoSceneScaffold.ts";
import IStorage from "../../storage/IStorage.ts";
import {ISceneScaffold} from "../../components/scene/scaffold/ISceneScaffold.ts";
import {HtmlSceneScaffold} from "../../components/scene/scaffold/html/HtmlSceneScaffold.ts";
import {QuizSceneScaffold} from "../../components/scene/scaffold/quiz/QuizSceneScaffold.ts";
import {SlideSceneScaffold} from "../../components/scene/scaffold/slide/SlideSceneScaffold.ts";
import {ChatSceneScaffold} from "../../components/scene/scaffold/chat/ChatSceneScaffold.ts";

export class ScaffoldFactory implements IScaffoldFactory {

    private storage: IStorage

    constructor(storage: IStorage) {
        this.storage = storage
    }

    generate(type: SceneType): ISceneScaffold {

        switch (type) {
            case 'video':
                return new VideoSceneScaffold(this.storage)
            case 'html':
                return new HtmlSceneScaffold(this.storage)
            case 'chat':
                return new ChatSceneScaffold(this.storage)
            case 'quiz':
                return new QuizSceneScaffold(this.storage)
            case 'slide':
                return new SlideSceneScaffold(this.storage)
        }
    }

}