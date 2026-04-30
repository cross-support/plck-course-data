import IScene from "../IScene.ts";
import {HtmlConfigPerLocale} from "./html.type.ts";
import type {ISceneHtml} from "../../html/ISceneHtml.ts";
import type {ISceneJS} from "../../js/ISceneJS.ts";
import type {ISceneStyle} from "../../style/ISceneStyle.ts";
import type {IPLCKConfig} from "../../../../config/IPLCKConfig.ts";
import type {ISceneTemplate} from "../../template/ISceneTemplate.ts";
import type {IComponentName} from "../../../common/ValueObject/IComponentName.ts";
import {ComponentName} from "../../../common/ValueObject/ComponentName.ts";
import TemplateEjsResolver from "../../../common/TemplateResolver/TemplateEjsResolver.ts";
import type {SceneComponent} from "../../../common/common.type.ts";
import type {SceneType} from "../../../scene/Scene.type.ts";


export class HtmlScene implements IScene {

    protected config: HtmlConfigPerLocale;
    protected readonly js: ISceneJS;
    protected readonly style: ISceneStyle;
    protected readonly html: ISceneHtml;
    protected readonly _name: string;
    protected plckConfig: IPLCKConfig;
    protected template: ISceneTemplate;
    protected readonly _componentName: ComponentName

    constructor(
        name: string,
        plckConfig: IPLCKConfig,
        config: HtmlConfigPerLocale,
        js: ISceneJS,
        html: ISceneHtml,
        template: ISceneTemplate,
    ) {
        this.plckConfig = plckConfig
        this._name = name
        this.config = config
        this.js = js
        this.html = html
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


        // console.log({ componentName, config, primaryConfig })
        if (primaryConfig === undefined) throw new Error(`シーンHtml/${this._name}: デフォルトの言語設定が取得できませんでした。\n config.${defaultLang}.yamlが正しくシーンのディレクトリに保存されているか確認してください。`)

        const template = await this.template.load()

        const resolver = new TemplateEjsResolver(template, {
            name: this._name,
            config: defaultConfig,
            html: await this.html.load(),
            customHookUrl: await this.js.load(),
        })

        const componentString = await resolver.create()

        // Object.keys(defaultConfig.texts).forEach(key => {
        //     const exp = new RegExp(`['|"]${key}['|"]`, 'g')
        //     componentString = componentString.replace(exp, `"${this._name}_${key}"`)
        // })


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
        return 'html'
    }

    name(): string {
        return this._name
    }

    componentName(): IComponentName {
        return this._componentName
    }

    pathName(): string {
        return `html/${this._componentName.value()}.vue`;
    }

}