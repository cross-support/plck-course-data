import {computed, inject} from "vue";
import {FrameSetting, PLCKConfigType} from "@corePlck/config/config.type";
import { plckConfigKey } from "@/plugins/PlckPlugin";
import { useI18n } from "vue-i18n";
import {storeToRefs} from "pinia";
import {usePlckStore} from "@/store/plck.ts";


export const useHeader =  () => {

    /**
     * PLCKのコンフィグを取得
     */
    const plckConfig = inject<PLCKConfigType>(plckConfigKey)

    const { t } = useI18n()

    const { currentFrameIndex, currentSuspendDataState } = storeToRefs(usePlckStore())

    const isCompleted = computed(() => currentSuspendDataState.value ? currentSuspendDataState.value.complete === 'completed' : false)
    /**
     * メインタイトルを生成
     */
    const mainTitle = computed(() => t('main_title'))

    /**
     * タイトルを生成
     */
    const title = computed(() => {
        const targetFrame = plckConfig.frames[currentFrameIndex.value] as FrameSetting
        return t(`title.${targetFrame.main.name}`)
    })

    const showMenu = computed(() => {
        return plckConfig.scene_menu === 'on'
    })


    return {
        isCompleted,
        mainTitle,
        title,
        showMenu,
    }
}