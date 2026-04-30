#! /usr/bin/env node
import { program } from "commander";
import {FsStorage} from "../plck/storage/FsStorage";
import {PLCKConfig} from "../plck/config/PLCKConfig";
import {ScaffoldProvider} from "../plck/provider/scaffold/ScaffoldProvider";
import {ScaffoldFactory} from "../plck/factories/scaffold/ScaffoldFactory";
import {ViteConfigProvider} from "../vite/ViteConfigProvider.ts";
import { UnitScaffoldProvider } from "../plck/provider/scaffold/UnitScaffoldProvider.ts";
import { checkbox, select, input } from "@inquirer/prompts";
import { locals } from "../plck/i18n/localeList.ts";
import {PLCKConfigType} from "../plck/config/config.type.ts";
import { LanguageLocale } from "../plck/i18n/l18n.type.ts";

import path from 'node:path'
import { exec, spawn } from 'node:child_process'
// スコープとしては変数ではなく、import文で間に合うのではないでしょうか。
// 回答: おっしゃる通りimport文で問題ないため修正いたしました。

const basePath = path.resolve(`${process.cwd()}/`)
const scenePath = path.resolve(basePath + '/contents/scenes')
const unitPath = path.resolve(basePath + '/contents/units')

// path.join()を使う方がいいのではないでしょうか？
const corePlckSceneStorage = new FsStorage(basePath + '/core/plck/components/scene/scene')
const sceneStorage = new FsStorage(scenePath)

const factory = new ScaffoldFactory(corePlckSceneStorage)
const provider = new ScaffoldProvider(factory, sceneStorage)

// ユニット関連
const plckTempPath = path.resolve(basePath + '/.plck')
const vitePath = path.resolve(basePath + '/core/vite')
const contentPath = path.resolve(basePath + '/contents')

const plckTempStorage = new FsStorage(plckTempPath)
const viteStorage = new FsStorage(vitePath)
const contentStorage = new FsStorage(contentPath)

const viteConfigProvider = new ViteConfigProvider(contentStorage, plckTempStorage, viteStorage)


// init関連
const commandInitPath = path.resolve(basePath + '/core/commands/initialize')
const commandInitStorage = new FsStorage(commandInitPath)
const rootStorage = new FsStorage(basePath)


//

program
    .name('plck')
    .description('PLCKの開発をサポートするコマンドラインツールです')
    .version('0.5.0')
    // ここのversionは適当なものでしょうか？

program
    .command('add')
    .description('シーンの作成に必要なファイルを生成します')
    .argument('<type>', 'シーンのタイプを指定 video | chat | html | quiz | slide')
    .argument('<name>', 'シーンの名前を指定')
    .argument('[unitName]', '追加の対象となるユニット名を指定。')
    .action(async (type, name, unitName) => {
        try {
            const unitNames = await viteConfigProvider.getUnitNames()
            if (unitNames.length) {
                const hasUnitName = !!unitName
                const target = unitName || unitNames[0]
                if (unitNames.includes(target)) {
                    if (!hasUnitName) {
                        console.log(`ユニット: ${target}の設定をもとにシーンを作成します..`)
                    }
                    const plckConfigStorage = new FsStorage(path.resolve(unitPath + `/${target}`))
                    const plckConfig = new PLCKConfig(plckConfigStorage)
                    await provider.provide(type, name, plckConfig)
                } else {
                    console.log(`入力されたユニット名: ${unitName} を見つけることができませんでした。`)
                }
            } else {
                console.log(`ユニットがまだ作成されていません。シーンを追加するためにはまずユニットを作成してください。`)
            }
        } catch (e) {
            console.error(e.message)
        }

    })

program
    .command('add-unit')
    .description('ユニットのplck.config.yamlファイルを作成します')
    .argument('<name>', 'ユニットの名前を指定')
    .action(async (name) => {
        try {
            const unitStorage = new FsStorage(unitPath)
            const unitScaffoldProvider = new UnitScaffoldProvider(unitStorage)

            const langList = Object.keys(locals).map((locale) => ({ name: `${locale}(${locals[locale]})`, value: locale }))
            // ユニット
            let title = await input({ message: 'ユニットのタイトルを入力してください（初期値: タイトル）:' })

            title = title || 'タイトル'


            let defaultLang = await select({
                message: 'デフォルトの言語を指定してください（初期値: ja）:',
                choices: langList
            }) as LanguageLocale

            defaultLang = defaultLang || 'ja'

            const otherLang = await checkbox({
                message: 'その他の言語も設定する場合は以下から選択してください',
                choices: langList.filter((lang) => lang.value !== defaultLang)
            }) as LanguageLocale[]

            otherLang.unshift(defaultLang)

            const config: PLCKConfigType = {
                title,
                default_lang: defaultLang,
                display_complete_alert: 'on',
                complete_flg_scene: '',
                scene_menu: 'on',
                multi_lang: otherLang.length ? 'on' : 'off',
                popup_explanation_text: 'このユニットは終了です。お疲れ様でした',
                popup_next_unit_text: '次のユニットへ',
                popup_close_text: '終了する',
                label_text: '言語を選択してください',
                lang: otherLang,
                frames: []
            }

            await unitScaffoldProvider.provide(name, config)

            console.log(`contents/${name} が正常に作成されました。`)


        } catch (e) {
            console.error(e.message)
        }

    })

program
    .command('init')
    .description('コンテンツ開発に必要な初期ファイルを生成します')
    .action(async () => {

        // contentsの存在確認。あれば実行しない
        if (await rootStorage.exists('contents')) {
            console.error('contentsディレクトリが存在する場合は初期ファイル生成を行うことはできません')
        } else {
            // なければinitialize/contentsの中身をコピーする
            await commandInitStorage.copy('contents', contentPath, true)
            console.log('ディレクトリのコピーが完了しました。')
        }

    })

program
    .command('start')
    .description('指定したユニット名の開発環境をスタートさせます')
    .argument('<unitName>', 'ユニットのディレクトリの名前')
    .action(async (unitName) => {

        await viteConfigProvider.provide()
        const unitNames = await viteConfigProvider.getUnitNames()
        if (unitNames.includes(unitName)) {
            let vite
            if (process.platform.match(/^win/)) {
                vite = spawn('npx', [ `vite --config .\\.plck\\vite.config.${unitName}.ts` ], { shell: true, stdio: 'inherit' })
            } else {
                vite = spawn('npx', [ `vite --config ./.plck/vite.config.${unitName}.ts` ], { shell: true, stdio: 'inherit' })
            }
        } else {
            console.log(`入力されたユニット名: ${unitName} を見つけることができませんでした。\ncontent/units内にあるユニットフォルダは以下の通りです。`)
            console.log(`----\n`)
            console.log(unitNames.reduce((result, name) => {
                result += name + '\n'
                return result
            }, ''))
            console.log(`----`)
        }

    })

program
    .command('build')
    .description('PLCKの公開用ディレクトリを作成します')
    .argument('[dirname]', 'ビルドされたファイルを設置するフォルダ名を指定します。指定しない場合は dist フォルダとなります')
    .action(async (dirname) => {
        const _dirname = dirname || 'dist'
        await viteConfigProvider.provide(_dirname)
        const unitNames = await viteConfigProvider.getUnitNames()
        for (let i = 0; i < unitNames.length; i++) {
            const unitName = unitNames[i]
            const vite = exec(`npx vite build --config ./.plck/vite.config.${unitName}.ts`)
            vite.stdout.pipe(process.stdout)
        }
    })

program.parse()
