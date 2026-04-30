import fs from 'node:fs/promises'
import path from 'node:path'


/**
 * 対応する画像形式の一覧
 */
const imageMimeTypes: Object = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.tiff': 'image/tiff',
    '.webp': 'image/webp',
}

const allowExtensions = Object.keys(imageMimeTypes)

/**
 * MimeTypeを取得する
 * @param targetPath
 */
function getMimeType(targetPath: string) {

    const ext = path.extname(targetPath)
    if (!allowExtensions.includes(ext)) {
        throw new Error(`エラーファイルパス: ${targetPath}\n${ext}という拡張子には対応していません。以下のいずれかの拡張子のファイルを指定してください。\n${allowExtensions.join(',')}`)
    }
    return imageMimeTypes[ext]
}

/**
 * 入力された文字列にreplaceTargetから始まるパスが存在する場合に、
 * replaceTargetをpathToReplaceに置き換えたパスでファイルを検索しそのファイルをbase64に変換する
 * 対応しない拡張子の場合はエラーとなる
 * @param pathString
 * @param replaceTarget
 * @param pathToReplace
 */
export default async (
    pathString: string,
    replaceTarget: string = '@scenes',
    pathToReplace: string
): Promise<string> => {

    const sceneSearchRegExp = new RegExp(replaceTarget)
    // 属性文字列の検索
    const srcPattern = `src=["|']([^"']*)["|']`
    // グローバルで複数検索する
    const srcGlobalRegExp = new RegExp(srcPattern, "g")
    // 一つ一つのsrcの検索用
    const srcRegExp = new RegExp(srcPattern)

    if (pathString.match(sceneSearchRegExp)) {

        /**
         * 画像の属性の場合の置き換え
         */
        if (pathString.match(srcGlobalRegExp)?.length) {

            let result = pathString
            const list = pathString.match(srcGlobalRegExp)
            for (const index in list) {
                const srcStr = list[index]
                const path = srcStr.match(srcRegExp)[1]
                const absolutePath = path.replace(replaceTarget, pathToReplace)
                const mimeType = getMimeType(absolutePath)
                const base64 = await fs.readFile(absolutePath, { encoding: 'base64' })
                const srcStrRegExp = new RegExp(srcStr)
                result = result.replace(srcStrRegExp, `src="data:${mimeType};base64,${base64}"`)
            }

            return result

        } else {
            const absolutePath = pathString.replace(replaceTarget, pathToReplace)
            const mimeType = await getMimeType(absolutePath)
            const base64 = await fs.readFile(absolutePath, { encoding: 'base64' })
            return `data:${mimeType};base64,${base64}`
        }

    } else {
        return pathString
    }


}