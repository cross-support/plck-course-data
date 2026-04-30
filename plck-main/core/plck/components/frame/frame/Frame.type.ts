import IScene from "../../scene/scene/IScene";
import {SceneComponent} from "../../common/common.type";

export type Frame = {
    main: { scene: IScene, config: any },
    sub?: { scene: IScene, config: any },
    frameComponent: SceneComponent
}

export type FrameListItem = {
    main: {
        title: string
    }
    sub?: {
        title: string
    }
}