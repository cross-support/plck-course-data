import {IPLCKConfig} from "../../config/IPLCKConfig";

export interface IPLCKConfigProvider {
    provide(plckConfig: IPLCKConfig): Promise<void>
}