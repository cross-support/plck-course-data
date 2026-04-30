import IStorage from "../plck/storage/IStorage.ts";
import TemplateEjsResolver from "../plck/components/common/TemplateResolver/TemplateEjsResolver.ts";


export class ViteConfigProvider {

    private readonly contentStorage: IStorage
    private readonly plckTempStorage: IStorage
    private readonly viteStorage: IStorage


    constructor(
        contentStorage: IStorage,
        plckTempStorage: IStorage,
        viteStorage: IStorage
    ) {
        this.contentStorage = contentStorage
        this.plckTempStorage = plckTempStorage
        this.viteStorage = viteStorage
    }

    async getUnitNames(): Promise<string[]> {
        return this.contentStorage.readDir('/units', true)
    }

    async provide(dirname: string = 'dist'): Promise<void> {

        const unitNames = await this.getUnitNames()

        for (let i = 0; i < unitNames.length; i++) {

            const unitName = unitNames[i]
            const template = await this.viteStorage.get('vite.config.ts.ejs')
            const resolver = new TemplateEjsResolver(template, { unitName, dirname })
            const fileStr = await resolver.create()
            await this.plckTempStorage.put(`vite.config.${unitName}.ts`, fileStr)

        }

    }


}