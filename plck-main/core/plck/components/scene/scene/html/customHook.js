/**
 * HTMLファイルを読み込んだ後に処理をする内容を記述できます。
 */
export const onMount = (toCompeteCurrentScene, toUnCompeteCurrentScene) => {


    // ここにJavaScriptを記述することができます。
    console.log('onMount is executed.')
    const target = document.querySelector('.html-text')
    console.log(target)
    // document.querySelector('.html-text')[0].css.fontSize = "30px"


}

/**
 * ページが切り替わる際の処理を記述することができます。
 * Windowイベントなどを破棄する場合などに使用してください
 */
export const onUnmount = () => {

}

