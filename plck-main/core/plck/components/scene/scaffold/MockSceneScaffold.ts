import {ISceneScaffold} from "@corePlck/components/scene/scaffold/ISceneScaffold.ts";
import {ScaffoldFiles} from "@corePlck/components/scene/Scene.type.ts";

export class MockSceneScaffold implements ISceneScaffold {

    private scaffoldFiles: ScaffoldFiles

    constructor(scaffoldFiles: ScaffoldFiles) {
        this.scaffoldFiles = scaffoldFiles
    }

    async create(): Promise<ScaffoldFiles> {
        return this.scaffoldFiles
    }
}