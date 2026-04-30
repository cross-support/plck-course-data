import { useI18n } from "vue-i18n";
import {computed} from "vue";
import {usePlckStore} from "@/store/plck.ts";
import {storeToRefs} from "pinia";

/**
 * 以下のシーン共通ボタンのラベルを生成する
 * ButtonCloseUnit
 * Button
 * @param sceneName
 */
export default (sceneName: string) => {

    const { t } = useI18n()

    const {
        isLastFrame,
    } = storeToRefs(usePlckStore())

    /**
     * もし対応する言語の指定が存在しない場合は、空文字列にするように設定
     */
    const btnLabelNextScene = computed(() => {
        const str = t(`${sceneName}_btn_next_scene_name`)
        return str.match(/btn_next_scene_name/) ? '' : str
    })

    const btnLabelNextUnit = computed(() => {
        const str = t(`${sceneName}_btn_next_unit_name`)
        return str.match(/btn_next_unit_name/) ? '' : str
    })

    const btnLabelCloseUnit = computed(() => {
        const str = t(`${sceneName}_btn_end_unit_name`)
        return str.match(/btn_end_unit_name/) ? '' : str
    })

    /**
     * 最後のフレームでない場合: btn_next_scene_name のラベルが指定されていれば true
     * 最後のフレームの場合: btn_next_unit_name か btn_close_unit_name のラベルが指定されていれば true
     */
    const hasShowableButton = computed(() => {
        if (!isLastFrame.value) return !!btnLabelNextScene.value
        return !!(btnLabelNextUnit.value || btnLabelCloseUnit.value)
    })

    return {
        btnLabelCloseUnit,
        btnLabelNextScene,
        btnLabelNextUnit,
        hasShowableButton,
    }
}