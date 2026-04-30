import {usePlckStore} from "@/store/plck.ts";

export const useScrollComplete = () => {

    let timer = null

    const { toCompeteCurrentScene } = usePlckStore()

    async function scroll (e) {

        if (timer) clearTimeout(timer)
        timer = setTimeout(async () => {

            // console.log(e)
            const { clientHeight, scrollHeight, scrollTop } = e.target.scrollingElement || e.target
            const isScrollTop = scrollTop === 0
            const isScrollBottom = scrollHeight - clientHeight === parseInt(scrollTop)
            // console.log({ isScrollTop, isScrollBottom })
            if (isScrollBottom) {
                await toCompeteCurrentScene()
            }

        }, 100)
    }

    function onScrollComplete (target: Window | HTMLElement) {
        target.addEventListener('scroll', scroll)
    }

    function clearScrollComplete(target: Window | HTMLElement) {
        target.removeEventListener('scroll', scroll)
    }

    return {
        onScrollComplete,
        clearScrollComplete,
    }
}