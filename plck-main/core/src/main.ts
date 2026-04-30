// @plckは、.plckの動的ファイルを読み込んでいるため、type-checkの対象外とする
// @ts-ignore
import app from '@plck/main'

import {createPinia} from "pinia"

const pinia = createPinia()
app.use(pinia)

app.mount('#app')
