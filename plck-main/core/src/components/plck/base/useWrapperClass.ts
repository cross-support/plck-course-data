import {usePlckStore} from "@/store/plck.ts";
import {computed} from "vue";

/**
 *
 * 各シーンのラッパークラスを動的に生成する
 * 組み合わせフレームの場合: .resizable-frame
 * 組み合わせフレーム且つメインフレームに設定されている場合: .main-frame-scene
 * 組み合わせフレーム且つサブフレームに設定されている場合: .sub-frame-scene
 *
 */
export default (sceneName: string) => {
    const { isMainScene, isSubScene } = usePlckStore()

    /**
     * シーンのラッパークラスを生成し、配列を作成する
     */
    const sceneWrapperClass = computed(() => {
        if (isSubScene(sceneName)) return [ 'resizable-frame', 'sub-frame-scene' ]
        if (isMainScene(sceneName)) return [ 'resizable-frame', 'main-frame-scene' ]
        return []
    })

    return {
        sceneWrapperClass
    }
}