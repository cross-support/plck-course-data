import {Frame} from "../frame/frame/Frame.type";
import {PLCKConfigType} from "../../config/config.type";

export interface IMain {
    create(frames: Frame[], plckConfig: PLCKConfigType): Promise<string>
}