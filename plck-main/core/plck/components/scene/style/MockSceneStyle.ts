import {ISceneStyle} from "./ISceneStyle";

export class MockSceneStyle implements ISceneStyle {

    private str: string;

    constructor(str: string) {
        this.str = str
    }

    load(): Promise<string> {
        return Promise.resolve(this.str);
    }

}