import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from '@/App.vue'
import router from '@/router'
import PlckFrame from '@/components/plck/PlckFrame/PlckFrame.vue'
import messages from '@plck/i18n.js'
import plckPlugin from '@/plugins/PlckPlugin.ts'
import TalkSerif from '@/components/plck/base/TalkSerif.vue'
import TalkContext from '@/components/plck/base/TalkContext.vue'
import BaseInput from "@/components/plck/base/form/BaseInput.vue"
import ButtonPrevScene from "@/components/plck/base/ButtonPrevScene.vue"
import ButtonNextScene from "@/components/plck/base/ButtonNextScene.vue"
import ButtonNextUnit from "@/components/plck/base/ButtonNextUnit.vue"

// スタイルシートの読み込み
import '@scenes/common.css'
import '@/assets/css/normalize.css'
import '@/assets/css/common.css'
import '@/assets/css/component.css'
import 'aos/dist/aos.css'
import '@frame/unit-done-dialog/style.css'


import VideoVideoTest1 from '@plck/video/VideoVideoTest1.vue'
import VideoVideoTest2 from '@plck/video/VideoVideoTest2.vue'
import FrameVideoVideoTest1VideoVideoTest2 from '@plck/frame/FrameVideoVideoTest1VideoVideoTest2.vue'


const i18n = createI18n({
    legacy: false,
    locale: 'ja',
    fallbackLocale: 'ja',
    messages,
})

const app = createApp(App)
app.use(i18n)
app.use(plckPlugin)

app.component('PlckFrame', PlckFrame)
app.component('TalkSerif', TalkSerif)
app.component('TalkContext', TalkContext)
app.component('BaseInput', BaseInput)
app.component('ButtonPrevScene', ButtonPrevScene)
app.component('ButtonNextScene', ButtonNextScene)
app.component('ButtonNextUnit', ButtonNextUnit)

app.component('VideoVideoTest1', VideoVideoTest1)
app.component('FrameVideoVideoTest1VideoVideoTest2', FrameVideoVideoTest1VideoVideoTest2)
app.component('VideoVideoTest2', VideoVideoTest2)



app.use(router(app, i18n))



export default app