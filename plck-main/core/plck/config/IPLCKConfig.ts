import {PLCKConfigType} from "./config.type";

export interface IPLCKConfig {
    load(): Promise<PLCKConfigType>
}