// @review_sawada
// 名前的にはframeに関する処理をまとめられる想定のjsなのかなと思うのですが、
// src配下ではない理由を伺えますでしょうか？

// 回答: こちらはコンテンツ開発者がコンテンツに関連するをスクリプトを追加することができるようにするフックスクリプト（ライフサイクルフック）として設定している物です。
// npm run init を実行したときに、このファイルをコピーして contentsディレクトリを作成するため、この位置に配置しています。
export const unitCompleted = (() => {
    console.log('unit completed.')
})


export const frameCompleted = ((frameIndex) => {
    console.log('frame completed.', frameIndex)
})