//

import {PLCKConfig} from "./plck/config/PLCKConfig";
import {FsStorage} from "./plck/storage/FsStorage";
import {SceneFactory} from "./plck/factories/scene/SceneFactory";
import {I18nFactory} from "./plck/factories/i18n/I18nFactory";
import {Frame} from "./plck/components/frame/frame/Frame";
import {Main} from "./plck/components/main/Main";
import {SceneProvider} from "./plck/provider/scene/SceneProvider";
import {FrameProvider} from "./plck/provider/frame/FrameProvider";
import {I18nProvider} from "./plck/provider/i18n/I18nProvider";
import {MainProvider} from "./plck/provider/main/MainProvider";
import {PLCK} from "./plck/PLCK";
import {PLCKConfigProvider} from "./plck/provider/plckConfig/PLCKConfigProvider";
import {RepositoryProvider} from "./plck/provider/repository/RepositoryProvider";
import {Repository} from "./plck/components/repository/Repository.ts";
import * as process from "process";

const defaultRootPath = process.cwd()
// console.log({ defaultRootPath })
/**
 * PLCKクラスを作成する
 * 各インスタンスの生成を実行する
 */
export default (
    unitName: string = '',
    unitPath: string = `${defaultRootPath}/contents/units`,
    plckPath: string = `${defaultRootPath}/.plck`,
    scenePath: string = `${defaultRootPath}/contents/scenes`,
    coreScenePath: string = `${defaultRootPath}/core/plck/components/scene/scene`,
    coreFramePath: string = `${defaultRootPath}/core/plck/components/frame`,
    coreMainPath: string = `${defaultRootPath}/core/plck/components/main`,
    coreRepositoryPath: string = `${defaultRootPath}/core/plck/components/repository`
) => {

    const targetUnitPath = `${unitPath}/${unitName}`

    const plckTempPath = `${plckPath}/${unitName}`
    /**
     * Storageの作成
     */
    // コンフィグファイル
    const plckConfigStorage = new FsStorage(targetUnitPath)

    // 生成されたコンポーネントの保存先
    const plckStorage = new FsStorage(plckTempPath)

    // 作成されたシーンの設定ファイルの設置場所
    const sceneStorage = new FsStorage(scenePath)

    // コアのシーンの設置場所
    const coreSceneStorage = new FsStorage(coreScenePath)

    const coreFrameStorage = new FsStorage(coreFramePath)

    const coreMainStorage = new FsStorage(coreMainPath)

    const coreRepositoryStorage = new FsStorage(coreRepositoryPath)

    // PLCKのコンフィグ
    const plckConfig = new PLCKConfig(plckConfigStorage)



    /**
     * Factory
     */
    const sceneFactory = new SceneFactory(sceneStorage, coreSceneStorage, plckConfig)

    const i18nFactory = new I18nFactory()

    /**
     * 各インスタンス作成
     */

    const frame = new Frame(coreFrameStorage, sceneFactory)

    const main = new Main(coreMainStorage)

    const repository = new Repository(coreRepositoryStorage, process.env.NODE_ENV === 'development')


    /**
     * Provider
     */
    const sceneProvider = new SceneProvider(plckStorage)

    const frameProvider = new FrameProvider(plckStorage)

    const i18nProvider = new I18nProvider(plckStorage)

    const mainProvider = new MainProvider(plckStorage)

    const plckConfigProvider = new PLCKConfigProvider(plckStorage)

    const repositoryProvider = new RepositoryProvider(plckStorage)


    return new PLCK(
        plckConfig,
        frame,
        main,
        repository,
        sceneFactory,
        i18nFactory,
        sceneProvider,
        frameProvider,
        mainProvider,
        i18nProvider,
        plckConfigProvider,
        repositoryProvider,
        scenePath
    )

}

