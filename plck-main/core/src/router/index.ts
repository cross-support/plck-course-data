import { createRouter, createWebHistory } from 'vue-router'
import MainFrame from "../views/MainFrame/MainFrame.vue";
// initRepositoryはビルド時に生成される@plckからの参照のため@ts-ignoreする
// @ts-ignore
import initRepository from "@plck/repository"
import type IProseedsRepository from "@corePlck/repository/IProseedsRepository.ts";
import {usePlckStore} from "@/store/plck.ts";
// @review_sawada こちらのimpoort必要でしょうか？
// 回答: 不要だったため削除いたしました。

let repository: IProseedsRepository | undefined;
let initialized = false

/**
 * @param app
 * @param i18n
 * @param routePlugins 外からルーター機能を拡張できるように関数を渡せるようにする
 */
export default (app, i18n, routePlugins = function (app, to, from , next) { next() }) => {

  // LearningCustomKit/frame.html?LW=3&data=contents/data/C01U01.json
  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
      {
        path: '/:pathMatch(.*)*',
        name: 'home',
        component: MainFrame,
      },
    ]
  })

  router.beforeEach(async (to, from, next) => {
    routePlugins(app, to, from , next)
  })

  router.beforeEach(async (to, from, next) => {

    const parameter = to.query as {
      UnitId: string | number
      UserLearningLessonId: string | number
      LecturePathSortNo: string | number
      UserId: string | number
      UserLearningUnitId: string | number
      Root: string,
      // @review_sawada
      // これはLWのバージョンを入れる想定ですかね？
      // 型がnumberだけではなかったので、バージョンなのかURLなのかが
      // わたしがパッと見たときに理解しきれなかったので質問です。
      // 回答: バージョンになります。クエリからのデータ取得の場合数値でも文字列としてわたってくる可能性があるため、文字列も許容する形としました。
      LW: string | number
    }

    if (!repository) {
      repository = initRepository(parameter, parameter.LW)
      app.provide('$repository', repository)
    }

    if (!initialized) {
      const { setUnitData, getSuspendData, getControllerData, getLocale } = usePlckStore()
      setUnitData(parameter.UnitId, parameter.UserLearningLessonId, parameter.LecturePathSortNo)
      const savedLocale = await getLocale()
      if (savedLocale) {
        i18n.global.locale._setter(savedLocale)
      }
      await getSuspendData()
      await getControllerData()
      initialized = true
    }

    next()
  })


  return router
}
