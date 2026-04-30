import {FrameSetting} from "../../../config/config.type";
import {Frame} from "./Frame.type";

export interface IFrame {
    create(setting: FrameSetting): Promise<Frame>
}