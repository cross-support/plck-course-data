import { computed, reactive, inject } from 'vue'
import {useI18n} from "vue-i18n";
import arrayGroup from "../../../../helper/arrayGroup";
import type {PLCKConfigType} from "@corePlck/config/config.type";
import { plckConfigKey } from "@/plugins/PlckPlugin";
import {storeToRefs} from "pinia";
import {usePlckStore} from "@/store/plck.ts";

/**
 * メニューの分割数
 * シーンの数が多いと、メニューを以下の数値毎に分割して表示する
 */
const MENU_ITEMS_PER_LIST = 6

export const useMenu = () => {

    const state = reactive({
        currentMenuPage: 0,
    })

    const plckConfig = inject<PLCKConfigType>(plckConfigKey)

    const { t } = useI18n()

    const { setCurrentFrameIndex } = usePlckStore()
    const { suspendDataStates, currentFrameIndex } = storeToRefs(usePlckStore())
    // state: unitIdは未使用ですかね。
    // 回答: unitIdは未使用だったため削除しました

    const menuListItem = computed(() => {
        if (!plckConfig) return []
        const listItems = plckConfig.frames.map((frame, index) => {
            // console.log(suspendDataStates)
            return {
                title: t(`${frame.main.name}_title`),
                index,
                type: frame.main.type,
                completed: suspendDataStates.value && suspendDataStates.value.length ? suspendDataStates.value[index]?.complete === 'completed' : false,
                isCurrent: currentFrameIndex.value === index
            }
        })
        return arrayGroup(listItems, MENU_ITEMS_PER_LIST)
    })

    const currentMenuListItem = computed(() => {
        return menuListItem.value[state.currentMenuPage]
    })

    const menuItemPageLength = computed(() => menuListItem.value.length)

    const hasNextPage = computed(() => {
        return state.currentMenuPage + 1 < menuItemPageLength.value
    })

    const hasPrevPage = computed(() => {
        return state.currentMenuPage !== 0
    })

    const isMultiLang = computed(() => {
        return plckConfig.multi_lang === 'on'
    })

    function onChangeScene(index) {
        setCurrentFrameIndex(index)
    }

    function toNextPage() {
        state.currentMenuPage += 1
    }

    function toPrevPage() {
        state.currentMenuPage -= 1
    }

    return {
        state,
        menuListItem,
        currentMenuListItem,
        menuItemPageLength,
        hasNextPage,
        hasPrevPage,
        isMultiLang,
        toPrevPage,
        toNextPage,
        onChangeScene,
    }
}