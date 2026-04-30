import {ITemplateResolver} from "./ITemplateResolver";
import styleSheetReplacement from "../../../../helper/styleSheetReplacement.ts";

const ejs = require('ejs')

export default class TemplateEjsResolver implements ITemplateResolver {

    private readonly template: string;
    private readonly option: any;

    constructor(template: string, option: any) {
        this.template = template
        this.option = option
    }

    async create(): Promise<string> {
        return ejs.render(
            this.template,
            {
                ...this.option,
                // ヘルパークラス
                // スタイルシートを置き換えるメソッドを追加
                styleSheetReplacement
            }
        )
    }

}