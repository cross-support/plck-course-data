import {usePlckStore} from "@/store/plck.ts";
import {storeToRefs} from "pinia";


export const useScene = (sceneName: string) => {


    const { isSubScene, changeSceneCompleteState } = usePlckStore()
    const { currentFrameIndex, isCurrentCompleteOnShow } = storeToRefs(usePlckStore())

    /**
     * シーンの共通初期処理を実行する
     * ・当該のシーンが表示したら完了状態にする（ただし、該当のシーンがsubの場合は実行しない）
     */
    async function sceneInitialized () {

        // sub Sceneの場合は早期リターン
        if (isSubScene(sceneName)) return


        if (isCurrentCompleteOnShow.value) {
            await changeSceneCompleteState(currentFrameIndex.value, 'completed')
        }

    }

    return {
        sceneInitialized
    }
}