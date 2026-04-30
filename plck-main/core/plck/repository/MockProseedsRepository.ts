import IProseedsRepository from "./IProseedsRepository";
import {SuspendData} from "./SuspendData";
import {ControllerData} from "./repository.type";
import {PLCKConfigType} from "../config/config.type";
// なんとなく想像できますが、このファイルの目的と使用方法をおしえてもらえますでしょうか。
// 回答: こちらはローカル開発時において使用されるモックアップです。
// ローカル開発の場合だと、LMSの各APIにアクセスできないため、開発時（NODE_ENV === 'development'）のときはこちらを読み込むように設定されています。


export default class MockProseedsRepository implements IProseedsRepository {

    private cacheStorage = {}
    private plckConfig: PLCKConfigType
    private unitId: string | number;
    private userLearningLessonId: string | number;

    constructor(initialStorage: {} = null, plckConfig: PLCKConfigType) {
        if (initialStorage) {
            this.cacheStorage = initialStorage
        }

        this.unitId = 1
        this.userLearningLessonId = 1
        this.plckConfig = plckConfig
    }

    async getControllerData(): Promise<ControllerData> {

        const modelLocation = `getControllerData_${this.userLearningLessonId}_${this.unitId}`
        if (!this.cacheStorage[modelLocation]) {

            this.cacheStorage[modelLocation] = {
                errcode: '',
                result: 'success',
                nextlesson: {
                    url: "",
                    state: "1"
                },
                nextpage: {
                    url: "",
                    state: "0"
                },
                prevlesson: {
                    url: "",
                    state: "0"
                },
                prevpage: {
                    url: "",
                    state: "0",
                }
            }

        }

        return this.cacheStorage[modelLocation]

    }

    async getSuspendData(): Promise<SuspendData> {

        const modelLocation = `suspendData_${this.userLearningLessonId}_${this.unitId}`
        if (!this.cacheStorage[modelLocation]) {

            // const frameStateArr = this.plckConfig.frames.reduce((arr) => {
            //     arr.push('{}')
            //     return arr
            // }, []
            // this.cacheStorage[modelLocation] = `${frameStateArr.join(',')},last_open_page:""`
            // this.cacheStorage[modelLocation] = `{complete:true},{complete:true},last_open_page:""`
            this.cacheStorage[modelLocation] = ``

        }

        return new SuspendData(this.cacheStorage[modelLocation])
    }

    async setCompleteUnit(): Promise<boolean> {
        console.log("setCompleteUnit is Requested..")
        return true;
    }

    async setSuspendData(suspendData: SuspendData): Promise<boolean> {
        console.log('setSuspendData is Requested.', suspendData)
        this.cacheStorage[`suspendData_${this.userLearningLessonId}_${this.unitId}`] = suspendData.createSuspendDataString()
        return true
    }

}