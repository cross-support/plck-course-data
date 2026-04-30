import {IFrame} from "./IFrame";
import {FrameSetting} from "../../../config/config.type";
import { Frame as FrameType } from "./Frame.type";
import IStorage from "../../../storage/IStorage";
import TemplateEjsResolver from "../../common/TemplateResolver/TemplateEjsResolver";
import {ISceneFactory} from "../../../factories/scene/ISceneFactory";
import {FrameName} from "../../common/ValueObject/FrameName";

export class Frame implements IFrame {

    private storage: IStorage;
    private factory: ISceneFactory;

    constructor(
        frameStorage: IStorage,
        factory: ISceneFactory,
    ) {
        this.storage = frameStorage
        this.factory = factory
    }

    async create(setting: FrameSetting): Promise<FrameType> {

        const result = {} as FrameType
        const template = await this.storage.get('frame/Frame.vue.ejs')
        const { scene: mainScene, config: mainConfig } = await this.factory.generate(setting.main.type, setting.main.name)
        const { scene: subScene = null, config: subConfig = null } = setting.sub ? await this.factory.generate(setting.sub.type, setting.sub.name) : {}

        const option: any = {
            mainSceneComponentName: mainScene.componentName().value(),
            subSceneComponentName: subScene ? subScene.componentName().value() : undefined,
            setting,
        }

        const name = new FrameName(mainScene.componentName(), subScene ? subScene.componentName() : undefined)

        const resolver = new TemplateEjsResolver(template, option)

        result.frameComponent = {
            type: 'frame',
            componentString: await resolver.create(),
            name,
            path: `frame/${name.value()}.vue`
        }

        result.main = { scene: mainScene, config: mainConfig }
        if (subScene) result.sub = { scene: subScene, config: subConfig }
        // console.log({result})
        return result;
    }

}