
const isObject = (value) => {
    return value !== null && typeof value === 'object'
}

/**
 * オブジェクトをフラットにしてキー名で深さを定義するオブジェクトを生成する
 * i18n用のオブジェクト生成用
 * 例:
 * @param obj
 * @param parentKeyName
 */
export const objectFlatter = (obj, parentKeyName = '') => {

    let result = {}
    const key = parentKeyName ? `${parentKeyName}_` : ''

    if (Array.isArray(obj)) {
        obj.forEach((_obj, i) => {
            const _keyName = `${key}${i}`
            if (isObject(_obj) || Array.isArray(_obj)) {
                result = { ...result, ...objectFlatter(_obj, _keyName) }
            } else {
                result[_keyName] = _obj
            }
        })
    } else {
        Object.keys(obj).forEach(_key => {
            const _keyName = `${key}${_key}`
            const target = obj[_key]
            if (isObject(target) || Array.isArray(target)) {
                result = { ...result, ...objectFlatter(target, _keyName) }
            } else {
                result[_keyName] = target
            }
        })
    }

    return result
}

/**
 * オブジェクトの構造をそのままに、そのオブジェクトのネスト構造を文字列にした値を持つ一覧を作成
 * i18nで文字列を取得する処理用
 * @param obj
 * @param parentKeyName
 * @param translate
 */
export const objectFlattenKeyForI18n = (obj, parentKeyName = '', translate = (key) => key) => {

    let result: any = {}
    const key = parentKeyName ? `${parentKeyName}_` : ''

    if (Array.isArray(obj)) {
        result = []
        obj.forEach((_obj, i) => {
            const _keyName = `${key}${i}`
            if (isObject(_obj) || Array.isArray(_obj)) {
                result.push(objectFlattenKeyForI18n(_obj, _keyName, translate))
            } else {
                result.push(translate(_keyName))
            }
        })
    } else {
        Object.keys(obj).forEach(_key => {
            const _keyName = `${key}${_key}`
            const target = obj[_key]
            if (isObject(target) || Array.isArray(target)) {
                result[_key] = objectFlattenKeyForI18n(target, _keyName, translate)
            } else {
                result[_key] = translate(_keyName)
            }
        })
    }

    return result
}
