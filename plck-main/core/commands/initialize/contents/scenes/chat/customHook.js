/**
 * HTMLファイルを読み込んだ後に処理をする内容を記述できます。
 * toCompleteCurrentScene・・・シーンを完了状態にできるメソッドです。任意のタイミングで実行してください。
 * toNotCompleteCurrentScene・・・シーンを未完了状態にできるメソッドです
 */
export const onMount = (toCompeteCurrentScene, toNotCompeteCurrentScene) => {


    // ここにJavaScriptを記述することができます。
    console.log('onMount is executed.')
    // document.querySelector('.html-text')[0].css.fontSize = "30px"


}

/**
 * ページが切り替わる際の処理を記述することができます。
 * Windowイベントなどを破棄する場合などに使用してください
 */
export const onUnmount = () => {

}

