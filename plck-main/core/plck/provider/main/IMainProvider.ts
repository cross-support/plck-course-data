import {IMain} from "../../components/main/IMain";
import {Frame} from "../../components/frame/frame/Frame.type";
import {PLCKConfigType} from "../../config/config.type";

export interface IMainProvider {
    provide(main: IMain, frames: Frame[], plckConfig: PLCKConfigType): Promise<void>
}