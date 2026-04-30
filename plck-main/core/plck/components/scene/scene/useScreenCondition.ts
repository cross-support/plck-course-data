import {storeToRefs} from "pinia";
import {usePlckStore} from "@/store/plck.ts";
import {ref, computed} from "vue"


export const useScreenCondition = (sceneName: string, onCalcWidth: Function = () => {}) => {

    const { isComboFrame } = storeToRefs(usePlckStore())
    /**
     * スマホの向きを確認
     */
    const orientationAngle = ref(screen.orientation.angle)
    /**
     * ウィンドウの幅
     * もしシーンがcomboシーンの場合は親のラッパーの幅にする
     */
    const windowWidth = ref(0)
    /**
     * ウィンドウの高さ
     * もしシーンがcomboシーンの場合は親のラッパーの幅にする
     */
    const windowHeight = ref(0)


    const orientation = computed<'landscape'|'portrait'>(() => {
        const landscapeList = [ 90, -90, 270 ]
        if (landscapeList.includes(orientationAngle.value)) return 'landscape'
        return 'portrait'
    })

    function calcWidth() {
        if (isComboFrame.value && isSubScene(sceneName)) {
            windowWidth.value = document.querySelector('.resizable-frame-side.sub').clientWidth
        } else {
            windowWidth.value = window.innerWidth
        }
        windowHeight.value = window.innerHeight
        onCalcWidth()
    }

    let timer = null

    function onResize (evt) {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            calcWidth()
        }, 300)
    }

    const screenConditionOnMount = () => {
        window.addEventListener('resize', onResize)
        window.addEventListener('orientationchange', (e) => {
            orientationAngle.value = screen.orientation.angle
            onResize(e)
        })
    }

    const screenConditionOnUnmount = () => {
        window.removeEventListener('resize', onResize)
        window.removeEventListener('orientationchange', onResize)
    }

    return {
        windowWidth,
        windowHeight,
        orientationAngle,
        orientation,
        screenConditionOnMount,
        screenConditionOnUnmount,
    }
}