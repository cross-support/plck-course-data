import {useI18n} from "vue-i18n";
import {computed} from "vue";
import {usePlckStore} from "@/store/plck";
import {objectFlattenKeyForI18n} from "../../../../../helper/objectFlatter.ts";


export const useHtml = (sceneName, chatKeys, textKeys) => {

    const {
        isCurrentCompleteOnShow,
        changeSceneCompleteState,
        toNotCompeteCurrentScene,
        toCompeteCurrentScene,
        isMainScene: _isMainScene,
        isSubScene: _isSubScene,
    } = usePlckStore()

    const { t } = useI18n()

    const chat = computed(() => {
        if (chatKeys) {
            return objectFlattenKeyForI18n(chatKeys, sceneName, t)
        }
        return {}
    })

    const text = computed(() => {
        if (textKeys) {
            return objectFlattenKeyForI18n(textKeys, sceneName, t)
        }
        return {}
    })

    const isMainScene = computed(() => _isMainScene(sceneName))
    const isSubScene = computed(() => _isSubScene(sceneName))

    return {
        chat,
        text,
        isMainScene,
        isSubScene,
        isCurrentCompleteOnShow,
        changeSceneCompleteState,
        toNotCompeteCurrentScene,
        toCompeteCurrentScene,
    }

}