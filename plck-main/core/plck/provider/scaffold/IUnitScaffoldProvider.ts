import {PLCKConfigType} from "@corePlck/config/config.type.ts";

export interface IUnitScaffoldProvider {
    provide(unitName: string, plckConfig: PLCKConfigType): Promise<void>
}
