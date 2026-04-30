import {VideoConfig} from "@corePlck/components/scene/scene/video/video.type.ts";
import {CSSProperties, ref} from "vue";
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import Cookie from 'js-cookie'
import {usePlckStore} from "@/store/plck.ts";
import {getDeviceName} from "@/helper/getDeviceName.ts";
import {getBrowserName} from "@/helper/getBrowsername.ts";
import {storeToRefs} from "pinia";
import useSpecificButton from "@/components/plck/base/useSpecificButton.ts";

/**
 * イベント名を定数化
 */
const MOVIE_EVENT = {
    MOVIE_END: 'PMoviePlayEndCallBack',
    MOVIE_IN_PROGRESS: 'PMovieSendPlayTime'
}

export const useVideo = (
    config: VideoConfig,
    name: string,
    videoInitialized: () => void
) => {

    const { t } = useI18n()

    const {
        changeSceneCompleteState,
        currentFrameIndex,
        unitId,
        setCurrentFrameIndex,
        controllerData,
        isLastFrame,
        hasNextUnit
    } = usePlckStore()

    const { currentSuspendDataState, hasNextScene } = storeToRefs(usePlckStore())
    const videoFrame = ref<HTMLIFrameElement>(null)

    const cookieName = {
        cue: `unitId/${unitId}/${name}:cue`
    }

    const videoUrl = computed(() => t(`${name}_video_url`))

    const {
        btnLabelNextUnit,
        btnLabelNextScene,
        btnLabelCloseUnit,
        hasShowableButton,
    } = useSpecificButton(name)

    const isCompleted = computed(() => currentSuspendDataState.value ? currentSuspendDataState.value.complete === 'completed' : false)

    const videoStyle = computed<CSSProperties>(() => {
        return {
            float: 'none',
            width: '100%'
        }
    })

    const getPMovieMessage = async function (evt): Promise<void> {
        if (typeof evt.data === 'string') {

            const [ eventName, meta ] = evt.data.split(',')

            switch(eventName) {
                case MOVIE_EVENT.MOVIE_END:
                    if (config.complete_end_video === 'on') {
                        // もし complete_end_video が onの時はリクエストを実行する
                        await changeSceneCompleteState(currentFrameIndex, 'completed')
                    }
                    break;
                case MOVIE_EVENT.MOVIE_IN_PROGRESS:
                    // 途中までの時間をクッキーに保存する
                    Cookie.set(cookieName.cue, meta)
                    break;
            }

        }
    }

    const componentOnMounted = function () {
        window.addEventListener('message', getPMovieMessage, false)
        videoInitialized()
    }

    const onIframeLoaded = function () {
        const cue = Cookie.get(cookieName.cue)
        if (cue) {
            const deviceName = getDeviceName()
            const browserName = getBrowserName()

            if (deviceName === "" || deviceName === "Macintosh") {
                // deviceNameが空の文字列であるのは、どのようなケースを想定されているのでしょうか？
                // 回答：すいません、こちらはもともとの実装を参考にしているため、この式についての詳細は不明です。。
                // 一旦こちらはこのまま移植した方が良いと判断したため、この実装としています。
                // 参考: old/source/scene/video/js/init.js:180
                const message = browserName === "Chrome" ? `PlayContinue_ch,${cue}` : `PlayContinue,${cue}`
                videoFrame.value.contentWindow.postMessage(message, "*")
            }
        }
    }

    const componentOnUnmounted = function () {
        window.removeEventListener('message', getPMovieMessage)
    }

    const onNextSceneButtonClicked = function () {
        setCurrentFrameIndex(currentFrameIndex + 1)
    }

    const onNextUnitButtonClicked = function () {
        const targetWindow = window.parent || window
        targetWindow.location.href = controllerData.nextlesson.url
    }

    return {
        videoUrl,
        videoStyle,
        videoFrame,
        btnLabelCloseUnit,
        btnLabelNextUnit,
        btnLabelNextScene,
        hasShowableButton,
        isCompleted,
        hasNextUnit,
        hasNextScene,
        isLastFrame,
        componentOnMounted,
        componentOnUnmounted,
        onIframeLoaded,
        onNextSceneButtonClicked,
        onNextUnitButtonClicked,
    }
}