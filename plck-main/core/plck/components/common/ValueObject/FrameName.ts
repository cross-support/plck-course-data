import {IComponentName} from "./IComponentName";

export class FrameName implements IComponentName {

    private readonly mainSceneName
    private readonly subSceneName

    constructor(mainSceneName: IComponentName, subSceneName?: IComponentName) {
        this.mainSceneName = mainSceneName
        this.subSceneName = subSceneName
    }

    value() {
        return `Frame${this.mainSceneName.value()}${this.subSceneName ? this.subSceneName.value() : ''}`
    }
}