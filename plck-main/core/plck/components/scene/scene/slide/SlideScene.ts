import IScene from "../IScene";
import {SceneComponent} from "../../../common/common.type";
import {ISceneJS} from "../../js/ISceneJS";
import {ISceneStyle} from "../../style/ISceneStyle";
import {SlideConfig, SlideConfigPerLocale} from "./slide.type.ts";
import {IPLCKConfig} from "../../../../config/IPLCKConfig";
import {ISceneTemplate} from "../../template/ISceneTemplate";
import TemplateEjsResolver from "../../../common/TemplateResolver/TemplateEjsResolver";
import {SceneType} from "../../Scene.type";
import {ComponentName} from "../../../common/ValueObject/ComponentName";
import {IComponentName} from "../../../common/ValueObject/IComponentName";
import {LanguageLocale} from "@corePlck/i18n/l18n.type.ts";
import { v4 as uuid } from 'uuid';

export default class SlideScene implements IScene {

    private config: SlideConfigPerLocale;
    private readonly js: ISceneJS;
    private readonly style: ISceneStyle;
    private readonly _name: string;
    private plckConfig: IPLCKConfig;
    private template: ISceneTemplate;
    private readonly _componentName: ComponentName
    
    constructor(
        name: string,
        plckConfig: IPLCKConfig,
        config: SlideConfigPerLocale,
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
        if (primaryConfig === undefined) throw new Error(`シーンSlide/${this._name}: デフォルトの言語設定が取得できませんでした。\n config.${defaultLang}.yamlが正しくシーンのディレクトリに保存されているか確認してください。`)

        const template = await this.template.load()

        // 各言語ごとのスライド一覧の作成
        // もし各言語ごとの設定になければprimaryと同じ設定を行う
        const slides = this.createSlide(defaultLang, defaultConfig)

        const resolver = new TemplateEjsResolver(template, {
            id: uuid(),
            name: this._name,
            config: defaultConfig,
            slides,
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


    createSlide(defaultLang: LanguageLocale = 'ja', defaultConfig: SlideConfig) {

        const result = {}
        result[defaultLang] = defaultConfig.img
        const imageUrls= Object.keys(this.config).filter((locale) => locale !== defaultLang).reduce((obj, locale) => {
            /**
             * もし当該の言語設定に一つも画像が含まれていない場合はdefaultConfigの値を使用する
             *
             */
            if (!this.config[locale].img || this.config[locale].img.length === 0) {
                obj[locale] = defaultConfig.img
            } else {
                obj[locale] = this.config[locale].img
            }
            return obj
        }, result as { [key in LanguageLocale]?: string[] })

        // const imageObject = Object.keys(imageUrls).reduce((obj, locale) => {
        //     const img = imageUrls[locale] as string[]
        //     obj[locale] = img.map((_img,i) => `${locale}_img_${i}`)
        //     return obj
        // }, {})

        return imageUrls

    }

    type(): SceneType {
        return 'slide'
    }

    name(): string {
        return this._name
    }

    componentName(): IComponentName {
        return this._componentName
    }

    pathName(): string {
        return `slide/${this._componentName.value()}.vue`;
    }

}