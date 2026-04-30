import {ISceneJS} from "./ISceneJS";

export class MockSceneJs implements ISceneJS {

    private str: string;

    constructor(str: string) {
        this.str = str
    }

    load(): Promise<string> {
        return Promise.resolve(this.str);
    }

}