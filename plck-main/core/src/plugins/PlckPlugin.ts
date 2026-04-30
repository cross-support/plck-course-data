import type {App, InjectionKey} from "vue";
import type {PLCKConfigType} from "@corePlck/config/config.type";
import plckConfig from '@plck/plckConfig.js'

const _plckConfig = plckConfig as PLCKConfigType
export const plckConfigKey = Symbol() as InjectionKey<PLCKConfigType>

export default {
    install(app: App) {
        app.config.globalProperties.$plckConfig = _plckConfig
        app.provide(plckConfigKey, _plckConfig)
    }
}