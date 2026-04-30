import {IPLCKConfig} from "./IPLCKConfig";
import {PLCKConfigType} from "./config.type";

export class MockPLCKConfig implements IPLCKConfig {
    private config: object;

    constructor(config: object) {
        this.config = config
    }

    load(): Promise<PLCKConfigType> {
        return Promise.resolve(this.config as PLCKConfigType);
    }

}