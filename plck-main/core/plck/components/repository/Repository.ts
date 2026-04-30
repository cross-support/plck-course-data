import {IRepository} from "./IRepository.ts";
import IStorage from "../../storage/IStorage.ts";
import TemplateEjsResolver from "../common/TemplateResolver/TemplateEjsResolver.ts";

export class Repository implements IRepository {

    private storage: IStorage
    private readonly isDev: boolean

    constructor(storage: IStorage, isDev: boolean) {
        this.storage = storage
        this.isDev = isDev
    }

    async create(): Promise<string> {
        // isDevはconstructor()の引数などで外部から注入できるようになっているほうが保守性がいいと思ったのですが、いかがでしょうか。
        // 回答: コンストラクタで外部化いたしました
        const template = await this.storage.get('initRepository.ts.ejs')
        const resolver = new TemplateEjsResolver(template, { isDev: this.isDev })
        // TemplateEjsResolverも外部から注入できるようになっていたほうが保守性があると思ったのですが、いかがでしょうか。
        // 回答: TemplateResolverを念のためインターフェース化していますが、現状ejs以外の選択肢がないため、外からの注入は不要と判断しました。
        // DIコンテナを使っていればここも外部化ができると思うのですが。。TSのDIコンテナがデコレーター使っていて学習コストが高かったりするので使用を見送っています。
        // そのため、今回自前で初期化を行っているのでそこのコストを少し下げたかったという狙いもあります。
        const result = await resolver.create()

        return result
    }
}