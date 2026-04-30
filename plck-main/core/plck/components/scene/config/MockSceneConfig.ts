import {ISceneConfig} from "./ISceneConfig";

export class MockSceneConfig implements ISceneConfig {

    private config: object;

    constructor(config: object) {
        this.config = config
    }

    async load(): Promise<any> {
        return this.config;
    }

}