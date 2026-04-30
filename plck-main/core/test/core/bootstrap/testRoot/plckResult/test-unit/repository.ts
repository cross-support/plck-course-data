import type { PLCKConfigType } from "@corePlck/config/config.type"
import type IProseedsRepository from "@corePlck/repository/IProseedsRepository"


import LW1ProseedsRepository from "@corePlck/repository/LW1ProseedsRepository"
import LW2ProseedsRepository from "@corePlck/repository/LW2ProseedsRepository"
import LW3ProseedsRepository from "@corePlck/repository/LW3ProseedsRepository"

export default (baseUrl: string = '', version: string | number): IProseedsRepository => {
    switch (version) {
        case 1:
        case "1":
            return new LW1ProseedsRepository(baseUrl)
        case 2:
        case "2":
            return new LW2ProseedsRepository(baseUrl)
        default:
            return new LW3ProseedsRepository (baseUrl)
    }
}
