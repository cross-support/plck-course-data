import IScene from "../IScene";
import {SceneComponent} from "../../../common/common.type";
import {ISceneJS} from "../../js/ISceneJS";
import {ISceneStyle} from "../../style/ISceneStyle";
import {VideoConfigPerLocale} from "./video.type";
import {IPLCKConfig} from "../../../../config/IPLCKConfig";
import {ISceneTemplate} from "../../template/ISceneTemplate";
import TemplateEjsResolver from "../../../common/TemplateResolver/TemplateEjsResolver";
import {SceneType} from "../../Scene.type";
import {ComponentName} from "../../../common/ValueObject/ComponentName";
import {IComponentName} from "../../../common/ValueObject/IComponentName";
import { v4 as uuid } from 'uuid';

export default class VideoScene implements IScene {

    private config: VideoConfigPerLocale;
    private readonly js: ISceneJS;
    private readonly style: ISceneStyle;
    private readonly _name: string;
    private plckConfig: IPLCKConfig;
    private template: ISceneTemplate;
    private readonly _componentName: ComponentName
    
    constructor(
        name: string,
        plckConfig: IPLCKConfig,
        config: VideoConfigPerLocale,
        js: ISceneJS,
        style: ISceneStyle,
        template: ISceneTemplate
    ) {
        this.plckConfig = plckConfig
        this._name = name
        this.config = config
        this.js = js
        this.style = style
        this.template = template
        this._componentName = new ComponentName(this.type(), this._name)
    }

    async create(): Promise<SceneComponent> {

        const config = this.config
        const plckConfig = await this.plckConfig.load()
        const defaultLang = plckConfig.default_lang || 'ja'
        const primaryConfig = config[defaultLang]
        const componentName = this.componentName()
        const path = this.pathName()
        const defaultConfig = this.config[defaultLang]

        // console.log({ componentName, plckConfig, config, primaryConfig })
        if (primaryConfig === undefined) throw new Error(`シーンVideo/${this._name}: デフォルトの言語設定が取得できませんでした。\n config.${defaultLang}.yamlが正しくシーンのディレクトリに保存されているか確認してください。`)

        const template = await this.template.load()

        const resolver = new TemplateEjsResolver(template, {
            id: uuid(),
            name: this._name,
            config: defaultConfig,
            customHookUrl: await this.js.load(),
            style: await this.style.load()
        })

        const componentString = await resolver.create()

        return {
            type: this.type(),
            componentString,
            path,
            name: componentName,
            js: this.js,
            style: this.style,
        }
    }

    type(): SceneType {
        return 'video'
    }

    name(): string {
        return this._name
    }

    componentName(): IComponentName {
        return this._componentName
    }

    pathName(): string {
        return `video/${this._componentName.value()}.vue`;
    }

}