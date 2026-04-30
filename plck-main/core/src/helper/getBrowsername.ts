
export type BrowserName = "MSIE" | "Trident" | "Firefox" | "Chrome" | "Linux" | "Safari" | ""

export const getBrowserName = (): BrowserName => {
    //ユーザーエージェント取得
    const _ua = navigator.userAgent;
    //ブラウザ名
    let browserName:BrowserName = "";
    //ブラウザ一覧
    const browser = ["MSIE","Trident","Firefox","Chrome","Linux","Safari"];
    for (const i in browser) {
        const pattern = new RegExp(browser[i], "i");
        //一致したブラウザ名を入れる
        if (pattern.test(_ua)) {
            browserName = browser[i] as BrowserName;
            break;
        }
    }
    return browserName;
    // こちら想定していないブラウザからのアクセスの場合、空文字が返る可能性がありますかね。そのエラーハンドリングをお願いしたいです。
    // 回答: useVideo.tsで、空文字列を想定した処理を行っているので、現状はその仕様で問題ないかと思います。
    // useVideo.tsでも記載しましたが、もともとの実装を参考にしているため、一旦このままの移植が良いかと思っております。。（どのような影響があるかわからないため。。）
}
