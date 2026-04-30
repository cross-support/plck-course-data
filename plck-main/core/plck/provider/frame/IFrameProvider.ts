import {Frame} from "../../components/frame/frame/Frame.type";

export interface IFrameProvider {
    provide(frame: Frame): Promise<void>
}