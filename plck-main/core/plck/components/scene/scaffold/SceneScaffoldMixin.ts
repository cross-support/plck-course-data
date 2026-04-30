import type IStorage from "../../../storage/IStorage";
import type { ISceneScaffold } from "./ISceneScaffold";
import type { ScaffoldFiles, SceneType } from "../Scene.type";


export class SceneScaffoldMixin implements ISceneScaffold {

    protected targets: ('js'| 'html' | 'css' | 'config')[] = ['config']
    protected type: SceneType | '' = ''
    protected storage: IStorage

    constructor (storage: IStorage) {
        this.storage = storage
    }

    html(): string {
        return `${this.type}/html.vue`
    }

    js(): string {
        return `${this.type}/customHook.js`
    }

    css(): string {
        return `${this.type}/style.css`
    }

    config(): string {
        return `${this.type}/config.yaml`
    }

    async create(): Promise<ScaffoldFiles> {

        const result: ScaffoldFiles = {
            config: await this.storage.get(this.config())
        }

        if (this.targets.includes('js')) {
            result.js = await this.storage.get(this.js())
        }

        if (this.targets.includes('css')) {
            result.css = await this.storage.get(this.css())
        }

        if (this.targets.includes('html')) {
            result.html = await this.storage.get(this.html())
        }

        return result
    }

}