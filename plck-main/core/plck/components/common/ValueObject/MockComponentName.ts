import {IComponentName} from "./IComponentName";

export class MockComponentName implements IComponentName {

    private readonly name: string

    constructor(name) {
        this.name = name
    }

    value(): string {
        return this.name
    }

}