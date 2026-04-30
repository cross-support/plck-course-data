import {IUnitScaffoldProvider} from "@corePlck/provider/scaffold/IUnitScaffoldProvider.ts";
import {PLCKConfigType} from "@corePlck/config/config.type.ts";
import IStorage from "@corePlck/storage/IStorage.ts";

const yaml = require('js-yaml')


export class UnitScaffoldProvider implements IUnitScaffoldProvider {


    private storage: IStorage

    constructor(storage: IStorage) {
        this.storage = storage
    }

    async provide(
        unitName: string,
        plckConfig: PLCKConfigType,
    ): Promise<void> {


        if (await this.storage.exists(`/${unitName}`)) {
            throw new Error(`${unitName}はすでに存在しています。別の名前を指定してください。`)
        }

        const baseConfigYaml = yaml.dump(plckConfig)
        await this.storage.put(`/${unitName}/plck.config.yaml`, baseConfigYaml)

        /**
         * 多言語の場合
         */
        if (plckConfig.multi_lang === 'on') {

            const languageYaml = yaml.dump({
                title: plckConfig.title,
                popup_explanation_text: plckConfig.popup_explanation_text,
                popup_next_unit_text: plckConfig.popup_next_unit_text,
                popup_close_text: plckConfig.popup_close_text,
                label_text: plckConfig.label_text,
            })

            for (let i = 0; i < plckConfig.lang.length; i++) {
                if (!plckConfig.default_lang === plckConfig.lang[i]) {
                    const targetLang = plckConfig.lang[i]
                    await this.storage.put(`/${unitName}/lang/${targetLang}.yaml`, languageYaml)
                }
            }

        }


    }


}