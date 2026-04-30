import {IPLCKConfig} from "./config/IPLCKConfig";
import {ISceneFactory} from "./factories/scene/ISceneFactory";
import {IFrameProvider} from "./provider/frame/IFrameProvider";
import {IFrame} from "./components/frame/frame/IFrame";
import {IMain} from "./components/main/IMain";
import {ISceneProvider} from "./provider/scene/ISceneProvider";
import {IMainProvider} from "./provider/main/IMainProvider";
import {II18nFactory} from "./factories/i18n/II18nFactory";
import {Ii18nProvider} from "./provider/i18n/Ii18nProvider";
import {PLCKConfigType} from "./config/config.type";
import {Frame} from "./components/frame/frame/Frame.type";
import {I18nList} from "./i18n/l18n.type";
import IScene from "./components/scene/scene/IScene";
import {IPLCKConfigProvider} from "./provider/plckConfig/IPLCKConfigProvider";
import {IRepositoryProvider} from "./provider/repository/IRepositoryProvider";
import localeList from "./i18n/localeList";
import {IRepository} from "./components/repository/IRepository.ts";
import importPathToBase64 from "../helper/importPathToBase64.ts";

export class PLCK {

    private plckConfig: IPLCKConfig
    private frame: IFrame
    private main: IMain
    private repository: IRepository
    private sceneFactory: ISceneFactory
    private i18nFactory: II18nFactory
    private sceneProvider: ISceneProvider
    private frameProvider: IFrameProvider
    private mainProvider: IMainProvider
    private i18nProvider: Ii18nProvider
    private plckConfigProvider: IPLCKConfigProvider;
    private repositoryProvider: IRepositoryProvider

    private cachedPlckConfig: PLCKConfigType
    private cachedI18nList: I18nList

    private scenePath: string

    constructor(
        plckConfig: IPLCKConfig,
        frame: IFrame,
        main: IMain,
        repository: IRepository,
        sceneFactory: ISceneFactory,
        i18Factory: II18nFactory,
        sceneProvider: ISceneProvider,
        frameProvider: IFrameProvider,
        mainProvider: IMainProvider,
        i18nProvider: Ii18nProvider,
        plckConfigProvider: IPLCKConfigProvider,
        repositoryProvider: IRepositoryProvider,
        scenePath: string,
    ) {
        this.plckConfig = plckConfig
        this.frame = frame
        this.main = main
        this.repository = repository
        this.i18nFactory = i18Factory
        this.sceneFactory = sceneFactory
        this.sceneProvider = sceneProvider
        this.frameProvider = frameProvider
        this.mainProvider = mainProvider
        this.i18nProvider = i18nProvider
        this.plckConfigProvider = plckConfigProvider
        this.repositoryProvider = repositoryProvider
        this.scenePath = scenePath
    }

    async createI18nList (frames: Frame[]): Promise<void> {

        let list = this.cachedI18nList || localeList as I18nList

        const plckConfigI18n = this.i18nFactory.generate("config", this.cachedPlckConfig, '', list)
        list = plckConfigI18n.generate()

        for (let i = 0; i < frames.length; i++) {
            const targetFrame = frames[i]
            const mainConfig = targetFrame.main.config
            // console.log({ mainConfig })
            list = await this._createI18nListFromScene(targetFrame.main.scene, targetFrame.main.config, list)
            if (targetFrame.sub) {
                list = await this._createI18nListFromScene(targetFrame.sub.scene, targetFrame.sub.config, list)
            }
        }

        await this._replaceScenePathToBase64(list)
        this.cachedI18nList = list
        return Promise.resolve()
    }

    async _createI18nListFromScene(scene: IScene, config: any, list): Promise<I18nList> {
        const type = scene.type()
        const name = scene.name()
        const i18n = this.i18nFactory.generate(type, config, name, list)
        const newList = await i18n.generate()
        return newList
    }

    /**
     * I18nに記述されている@scenesパスbase64形式に変換する
     * @param list
     */
    async _replaceScenePathToBase64(list: I18nList): Promise<void> {
        for (const locale in list) {
            const target = list[locale]
            for (const key in target) {
                if (target[key].match(/@scenes/)) {
                    target[key] = await importPathToBase64(target[key], '@scenes', this.scenePath)
                }
            }
        }
    }

    async init() {

        // PLCKのコンフィグを取得
        this.cachedPlckConfig = await this.plckConfig.load()

        // Frameの生成
        const frames = []
        for (let i = 0; i < this.cachedPlckConfig.frames.length; i++) {
            const frameSetting = this.cachedPlckConfig.frames[i]
            const frame = await this.frame.create(frameSetting)
            frames.push(frame)
        }

        await this.createI18nList(frames)

        // Provide
        await this.provideFrames(frames)
        await this.mainProvider.provide(this.main, frames, this.cachedPlckConfig)
        await this.i18nProvider.provide(this.cachedI18nList)
        await this.plckConfigProvider.provide(this.plckConfig)
        await this.repositoryProvider.provide(this.repository)

        return Promise.resolve()
    }

    async provideFrames(frames: Frame[]) {
        const threads = []
        for (let i = 0; i < frames.length; i++) {
            const target = frames[i]
            threads.push(this.frameProvider.provide(target))

            // scene
            const main = target.main.scene
            threads.push(this.provideScene(main))
            if (target.sub) {
                const sub = target.sub.scene
                threads.push(this.provideScene(sub))
            }
        }
        return Promise.all(threads)
    }

    async provideScene(scene: IScene): Promise<void> {
        return this.sceneProvider.provide(scene)
    }


}