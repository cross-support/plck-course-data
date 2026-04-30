import fg from 'fast-glob'
import bootstrap from "../bootstrap";
import path from 'node:path'

let plck = null
// eslint-disable-next-line no-undef
const basePath = path.resolve(`${process.cwd()}/`)

/**
 * 画面の更新対象となるファイルが更新されているかどうかを確認
 * @param file
 * @param files
 * @returns {boolean}
 */
const checkTargetIsUpdated = (file, files) => {
    // console.log(file, files, file.match(/plck\.config\.yaml$/))
    if (file.match(/plck\.config\.yaml$/)) return true
    const targetIsUpdated = files.find(_f => file.match(new RegExp(_f)))
    return !!targetIsUpdated
}

// eslint-disable-next-line no-undef

export default function PLCKPlugin(unitName) {

    plck = bootstrap(unitName)
    // console.log('PLCKPlugin::', unitName)

    return {
        name: 'plck-plugin',
        enforce: 'pre',
        async buildStart() {

            await plck.init()

            const files = [
                ...await fg('contents/scenes/**/*'),
                ...await fg('contents/units/**/*'),
                ...await fg('contents/frame/**/*'),
            ]
            // eslint-disable-next-line no-undef
            // console.log('buildStart!!------------', files, __dirname)

            // console.log({ basePath, files  })
            this.addWatchFile(`plck.config.yaml`)
            for (let file of files) {
                this.addWatchFile(file)
            }

        },
        async handleHotUpdate({file}) {
            // console.log('-----------test-plugin-handleHotUpdate-------')
            const files = [
                ...await fg('contents/scenes/**/*'),
                ...await fg('contents/units/**/*'),
                ...await fg('contents/frame/**/*'),
                ...await fg('core/plck/**/*')
            ]
            const targetIsUpdated = checkTargetIsUpdated(file, files)
            // console.log({ targetIsUpdated, files, file })
            if (targetIsUpdated) {
                console.log('plck updated.')
                plck.init()
            }
            // console.log(file)
        }
    }
}