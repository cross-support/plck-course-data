/**
 * ルート要素となるクラスに対して、&（同一ルート要素）の識別子を追記する
 */
export default (styleString: string, replaceToRootSelector: string[]) => {

    let result = styleString

    for (const i in replaceToRootSelector) {
        const selector = replaceToRootSelector[i]
        result = result.replace(new RegExp(`(\\s+|^.*)(${selector})(\\s+|{|\\.)`, 'g'), '$1&$2$3')
    }

    return result
}