import {IScaffoldFactory} from "../../factories/scaffold/IScaffoldFactory.ts";
import {ScaffoldFiles, SceneType} from "../../components/scene/Scene.type.ts";
import {MockSceneScaffold} from "../../components/scene/scaffold/MockSceneScaffold.ts";
import {ISceneScaffold} from "../../components/scene/scaffold/ISceneScaffold.ts";


export class MockScaffoldFactory implements IScaffoldFactory {

    private scaffoldFiles: { [key in SceneType]: ScaffoldFiles }

    constructor(scaffoldFiles: { [key in SceneType]: ScaffoldFiles }) {
        this.scaffoldFiles = scaffoldFiles
    }

    generate(type: SceneType): ISceneScaffold {
        switch (type) {
            case 'video':
                return new MockSceneScaffold(this.scaffoldFiles.video)
            case 'html':
                return new MockSceneScaffold(this.scaffoldFiles.html)
            case 'chat':
                return new MockSceneScaffold(this.scaffoldFiles.chat)
            case 'slide':
                return new MockSceneScaffold(this.scaffoldFiles.slide)
            case 'quiz':
                return new MockSceneScaffold(this.scaffoldFiles.quiz)
        }
    }

}