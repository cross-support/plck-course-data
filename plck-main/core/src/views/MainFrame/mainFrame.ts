import {inject, reactive, computed} from "vue";
import {ComponentName} from "@corePlck/components/common/ValueObject/ComponentName";
import {FrameName} from "@corePlck/components/common/ValueObject/FrameName";
import type {PLCKConfigType} from "@corePlck/config/config.type";
import {plckConfigKey} from "@/plugins/PlckPlugin";
import {usePlckStore} from "@/store/plck.ts";
import {storeToRefs} from "pinia";

interface mainFrameState {
    menuIsOpen: boolean
}

export const useMainFrame = () => {

    const plckConfig = inject<PLCKConfigType>(plckConfigKey)

    const state: mainFrameState = reactive({
        menuIsOpen: false
    })

    const handleToggleMenu = (toggleState: boolean) => {
        state.menuIsOpen = toggleState
    }

    const { currentFrameIndex, loading } = storeToRefs(usePlckStore())

    const componentName = computed<string>(() => {
        if (!plckConfig) return ''
        const currentFrame = plckConfig.frames[currentFrameIndex.value]
        const mainComponentName = new ComponentName(currentFrame.main.type, currentFrame.main.name)
        const subComponentName = currentFrame.sub ? new ComponentName(currentFrame.sub.type, currentFrame.sub.name) : undefined
        const frameName = new FrameName(mainComponentName, subComponentName)
        return frameName.value()
    })

    return {
        state,
        handleToggleMenu,
        componentName,
        loading,
    }
}