import {IFrameProvider} from "./IFrameProvider";
import IStorage from "../../storage/IStorage";
import {Frame} from "../../components/frame/frame/Frame.type";


export class FrameProvider implements IFrameProvider {

    private frameStorage: IStorage;

    constructor(frameStorage: IStorage) {
        this.frameStorage = frameStorage
    }

    async provide(frame: Frame): Promise<void> {
        // Frameを保存
        const path = `${frame.frameComponent.path}`
        await this.frameStorage.put(path, frame.frameComponent.componentString)
        return Promise.resolve()
    }

}