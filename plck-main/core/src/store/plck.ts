import type {SuspendData} from "@corePlck/repository/SuspendData";
import type {CompleteState, ControllerData, SuspendDataState} from "@corePlck/repository/repository.type";
// @review_sawada
// ここだけimportが相対パスになっているのはなぜでしょうか？(他にもあるとしたら理由同じだと思うのでここでお答えいただけますと幸いです)
// 回答: エイリアスでの読み込みで問題なかったため修正しました。
import type IProseedsRepository from "@corePlck/repository/IProseedsRepository";
import {defineStore} from "pinia";
import {computed, inject, ref, watch} from "vue";
import Cookie from "js-cookie";
import {LanguageLocale} from "@corePlck/i18n/l18n.type.ts";
import {plckConfigKey} from "@/plugins/PlckPlugin.ts";
import {FrameSetting} from "@corePlck/config/config.type.ts";
// @review_sawada File '/plck/frame/frameEvent.js' is not listed within the file list of project '/plck/tsconfig.app.json'. Projects must list all files or use an 'include' pattern.ts(6307)
// という警告が私のエディタだと出るのですが、松野尾さんのほうでは出てませんでしょうか？
// 回答: こちらはコンテンツディレクトリから読み込まれているファイルであるため、contentsが存在しない場合にエラーが発生してしまいます。
// 上記理由により、コンテンツ開発者依存のファイルとなるため、ts-ignoreでエラーを回避する形にいたします。

// contentsディレクトリ参照のファイルであるため、コンパイルエラーおよび警告回避のため@ts-ignoreする
// @ts-ignore
import { frameCompleted, unitCompleted } from '../../../contents/frame/frameEvent.js'

/**
 * 外部空の操作を制約するため、SuspendDataクラス自体はローカルクラスとして扱う
 */
let suspendData: SuspendData | null = null

if (process.env.NODE_ENV !== 'production') {
    console.log('not production')
    // @ts-ignore
    window.suspendData = () => suspendData
}

export const usePlckStore = defineStore('plck', () =>{

    const repository = inject('$repository') as IProseedsRepository
    const plckConfig = inject(plckConfigKey)

    const completeFlgSceneArray = (() => {
        if (plckConfig.complete_flg_scene === undefined || plckConfig.complete_flg_scene === null) return []
        if (typeof plckConfig.complete_flg_scene === 'number') return [ plckConfig.complete_flg_scene ]
        return plckConfig.complete_flg_scene.split(',').map(str => parseInt(str))
    })()

    const currentFrameIndex = ref<number>(0)
    const isAllSceneCompleted = ref(false)
    const loading = ref(false)
    const suspendDataStates = ref<SuspendDataState[]>([])
    const currentSuspendDataState = ref<SuspendDataState>(null)
    const controllerData = ref<ControllerData>(null)
    const unitId = ref<number | string>(null)
    const userLearningLessonId = ref<number | string>(null)
    const lecturePathSortNo = ref<number | string>(null)
    const completeOnShow = ref(completeFlgSceneArray)
    const showPopup = ref(false)


    /**
     * 次のユニットがあるかどうかを判定する
     */
    const hasNextUnit = computed(() => {
        if (controllerData.value) {
            return controllerData.value.nextlesson.url !== ''
        }
        return false
    })


    /**
     * 現在のフレームが、表示した瞬間に完了状態にするかどうかを設定する
     */
    const isCurrentCompleteOnShow = computed(() => {
        return completeOnShow.value.includes(currentFrameIndex.value + 1)
    })

    const totalFrameLength = computed(() => plckConfig.frames.length)

    /**
     * 前のシーンが存在するかどうか
     */
    const hasPrevScene = computed(() => currentFrameIndex.value !== 0)

    /**
     * 次のシーンが存在するか同zか
     */
    const hasNextScene = computed(() => totalFrameLength.value > (currentFrameIndex.value + 1))

    /**
     * 最後のシーン（Frame）かどうか
     */
    const isLastFrame = computed(() => {
        return currentFrameIndex.value === suspendDataStates.value.length - 1
    })

    /**
     * 表示されているフレームのシーン設定
     */
    const currentFrameInfo = computed<FrameSetting>(() => {
        return plckConfig.frames[currentFrameIndex.value]
    })

    /**
     * 表示されているシーンがmain/subの2フレーム構成かどうか
     */
    const isComboFrame = computed<boolean>(() => {
        return !!currentFrameInfo.value.sub
    })

    /**
     * 現在のフレームの番号を変更し、ページを移動する
     * @param frameIndex
     */
    function setCurrentFrameIndex (frameIndex: number): void {
        currentFrameIndex.value = frameIndex
        updateSuspendData()
    }

    /**
     * ローディング状態にする
     * @param loadingState
     */
    function setLoading (loadingState: boolean): void {
        loading.value = loadingState
    }

    /**
     * suspendDataの情報をstateに保存する
     */
    function updateSuspendData(): void {
        suspendDataStates.value = suspendData.getStates()
        currentSuspendDataState.value = suspendDataStates.value[currentFrameIndex.value]
        isAllSceneCompleted.value = suspendData.isAllSceneCompleted()
    }

    /**
     * Unitの情報をセットアップする
     * @param _unitId
     * @param _userLearningLessonId
     * @param _lecturePathSortNo
     */
    function setUnitData(_unitId: string | number, _userLearningLessonId: string | number, _lecturePathSortNo: string | number): void {
        unitId.value = _unitId
        userLearningLessonId.value = _userLearningLessonId
        lecturePathSortNo.value = _lecturePathSortNo
    }

    /**
     * 途中データを取得する
     */
    async function getSuspendData(): Promise<void> {
        const result: SuspendData = await repository.getSuspendData()
        suspendData = result
        /**
         * もし、suspendData.stateがframeの数よりも少ない場合は、その分のデータを作成する
         */
        if(plckConfig.frames.length > suspendData.getSuspendDataLength()) {
            const suspendDataLength = suspendData.getSuspendDataLength()
            const remain = plckConfig.frames.length - suspendDataLength
            for (let i = 0; i < remain; i++) {
                const targetIndex = suspendDataLength + i
                suspendData.updateSuspendData(targetIndex, { complete: 'not-yet' })
            }
        }

        if (plckConfig.frames.length < suspendData.getSuspendDataLength()) {
            suspendData.trimSuspendData(plckConfig.frames.length)
        }

        updateSuspendData()
    }

    /**
     * 途中データを更新する
     * 注意: 基本的にはprivate。action内のみから使用するのみにとどめる
     */
    async function setSuspendData() {
        await repository.setSuspendData(suspendData)
    }

    /**
     * コントローラーデータを取得する
     */
    async function getControllerData(): Promise<void> {
        const result: ControllerData = await repository.getControllerData()
        controllerData.value = result
    }

    /**
     * 完了ステータスを更新する
     * @param stateIndex
     * @param completeState
     */
    async function changeSceneCompleteState(stateIndex: number, completeState: CompleteState) {
        suspendData.changeSceneCompleteState(stateIndex, completeState)
        await setSuspendData()
        updateSuspendData()

        console.log('changeSceneCompleteState.......')
        // frameCompletedイベントを実行
        if (completeState === 'completed') {
            frameCompleted(stateIndex)
        }
    }

    /**
     * 現在表示されているシーンを完了状態にする
     */
    async function toCompeteCurrentScene() {
        await changeSceneCompleteState(currentFrameIndex.value, 'completed')
    }

    /**
     * 現在表示されているシーンを未完了状態にする
     */
    async function toNotCompeteCurrentScene() {
        await changeSceneCompleteState(currentFrameIndex.value, 'not-completed')
    }


    /**
     * 最後に開いたページを更新する
     * @param lastPageIndex
     */
    async function updateLastOpenPage(lastPageIndex: number) {
        suspendData.updateLastOpenPage(lastPageIndex)
        await setSuspendData()
        updateSuspendData()
    }


    /**
     * ユニット自体を完了状態にする
     */
    async function setCompleteUnit() {
        await repository.setCompleteUnit()
    }

    /**
     * クイズ形式の情報を更新する
     * @param stateIndex
     * @param questionIndex
     * @param selectedAnswer
     * @param result
     */
    async function updateQuestionResult(stateIndex: number, questionIndex: number, selectedAnswer: number | string | any[], result: boolean) {
        suspendData.updateQuestionResult(stateIndex, questionIndex, selectedAnswer, result)
        updateSuspendData()
    }

    /**
     * 現在の言語設定をクッキーに保存する
     * @param localeName
     */
    async function saveLocale(localeName: LanguageLocale): Promise<void> {
        Cookie.set(`unitId/${unitId.value}/locale`, localeName)
    }

    /**
     * 現在の言語設定をクッキーから取得する
     * multi_langがonの時だけ
     */
    async function getLocale(): Promise<LanguageLocale> {
        if (plckConfig.multi_lang === 'on') {
            const savedLocale = Cookie.get(`unitId/${unitId.value}/locale`)
            return savedLocale
        }
        return null
    }

    /**
     * このシーンがサブのシーンかを判定する
     * @param sceneName
     */
    function isSubScene(sceneName: string) {
        if (isComboFrame.value) {
            return currentFrameInfo.value.sub.name === sceneName
        }
        return false
    }

    /**
     * このシーンがメインのシーンかを判定する
     * @param sceneName
     */
    function isMainScene(sceneName: string) {
        console.log(currentFrameInfo.value, sceneName)
        if (isComboFrame.value) {
            return currentFrameInfo.value.main.name === sceneName
        }
        return false
    }

    /**
     * 次のフレームに移動する
     */
    function toNextScene(): void {
        // もし現在のフレームが最後のフレームなら実行しない
        // console.log(hasNextScene.value)
        if (!hasNextScene.value) return
        setCurrentFrameIndex(currentFrameIndex.value + 1)
    }

    /**
     * 前のフレームに移動する
     */
    function toPrevScene(): void {
        // もし現在のフレームが最初のフレームなら実行しない
        if (!hasPrevScene.value) return
        setCurrentFrameIndex(currentFrameIndex.value -1)
    }

    function toShowPopup(): void {
        if (plckConfig.display_complete_alert === 'on') {
            showPopup.value = true
        }
    }

    function toHidePopup(): void {
        showPopup.value = false
    }

    /**
     * 次のシーンに移動する
     */
    function toNextUnit(): void {
        if (!hasNextUnit.value) return
        const targetWindow = window.parent || window
        targetWindow.location.href = controllerData.value.nextlesson.url
    }

    /**
     * LMSの講座メニュー（/lesson/detail?id=UserLearningLessonId）へ親フレーム遷移する
     * Rootはrepository初期化時のクエリパラメータであり、store自体は保持していないため
     * 現在のURLのクエリから取得する（ページ遷移が発生しない構成のため常に有効な値が入る）
     */
    function toBackToMenu(): void {
        // PLCKはiframe内で動くため、閉じる対象は iframe自身ではなく講座ウィンドウ本体(window.top)
        try {
            const topWindow = window.top || window.parent || window
            topWindow.close()
        } catch (e) {
            /* cross-origin等でtop参照不可のケースは下のフォールバックに委ねる */
        }
        // close が無効な環境向けフォールバック: 閉じられなければメニューURLへ遷移（400ms後）
        const root = new URLSearchParams(window.location.search).get('Root')
        const id = userLearningLessonId.value
        if (!root || !id) return
        window.setTimeout(() => {
            try {
                const base = new URL(String(root), window.location.href)
                const menuUrl = base.origin + '/lesson/detail?id=' + encodeURIComponent(String(id))
                const targetWindow = window.parent || window
                targetWindow.location.href = menuUrl
            } catch (e) {
                /* noop */
            }
        }, 400)
    }

    /**
     * すべてのシーンが完了状態になった場合にユニットの完了リクエストを送信する
     * 完了状態に変化したときのみ（false => trueに変化したときのみ）となるため、
     * 再度Unitが完了状態になっている講座を開いても再度同じリクエストが起こることはない想定
     */
    watch(isAllSceneCompleted, async (value, prevValue) => {
        console.log({ value, prevValue })
        if (value === true) {
            console.log('frame completed..')
            await setCompleteUnit()
            // ユニットが完了した時に実行する
            unitCompleted()
        }
    })



    return {
        // states
        currentFrameIndex,
        isAllSceneCompleted,
        loading,
        suspendDataStates,
        currentSuspendDataState,
        controllerData,
        unitId,
        plckConfig,
        userLearningLessonId,
        lecturePathSortNo,
        completeOnShow,
        // computed(getter)
        isCurrentCompleteOnShow,
        hasNextUnit,
        hasNextScene,
        hasPrevScene,
        totalFrameLength,
        isLastFrame,
        currentFrameInfo,
        showPopup,
        isComboFrame,
        // actions
        setCurrentFrameIndex,
        setLoading,
        setUnitData,
        getSuspendData,
        getControllerData,
        changeSceneCompleteState,
        updateLastOpenPage,
        setCompleteUnit,
        updateQuestionResult,
        saveLocale,
        getLocale,
        isSubScene,
        isMainScene,
        toCompeteCurrentScene,
        toNotCompeteCurrentScene,
        toNextScene,
        toPrevScene,
        toNextUnit,
        toShowPopup,
        toHidePopup,
        toBackToMenu,
    }
})
