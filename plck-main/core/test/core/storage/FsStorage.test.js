import { describe, it, expect } from 'vitest'
import {FsStorage} from "../../../plck/storage/FsStorage";
import path from 'node:path'

describe('ファイル取得', () => {

    // eslint-disable-next-line no-undef
    const basePath = path.resolve(`${__dirname}/test-file-dir`)
    const storage = new FsStorage(basePath)

    it('一つのファイルを取得する', async () => {

        // eslint-disable-next-line no-undef
        const file = await storage.get('index.html')
        expect(file).toBe('this is html.')

    })

    it('複数のファイルを取得する', async () => {

        const files = await storage.getAll('fetch-all/**/*')
        console.log(files)
        const fileNames = Object.keys(files)
        expect(fileNames.length).toBe(4)
        expect(fileNames.includes('test.a.css')).toBe(true)
        expect(fileNames.includes('test.a.html')).toBe(true)
        expect(fileNames.includes('test.b.css')).toBe(true)
        expect(fileNames.includes('test.b.html')).toBe(true)

    })

    it('複数のファイルを取得する - 特定のファイルのみ', async () => {

        const files = await storage.getAll('fetch-all/**/*.css')
        const fileNames = Object.keys(files)
        expect(fileNames.length).toBe(2)
        expect(fileNames.includes('test.a.css')).toBe(true)
        expect(fileNames.includes('test.b.css')).toBe(true)

    })

    it('ファイルの作成および設置と削除', async () => {

        const file = 'file content'
        const fileName = 'put-test/test-file.txt'
        await storage.put(fileName, file)

        const createdFile = await storage.get(fileName)
        expect(createdFile).toBe('file content')
        // テストファイルの削除
        await storage.remove(fileName)

    })

    it('再起的にフォルダを作成してファイル作成と削除', async () => {

        const file = 'file content2.'
        const fileName = 'put-test/nested/folder/test-file.txt'
        await storage.put(fileName, file)

        const createdFile = await storage.get(fileName)
        expect(createdFile).toBe('file content2.')
        await storage.remove(fileName)

    })

    it('ディレクトリの中身を完全削除する', async () => {

        const directoryName = 'refresh-test'
        const files = [ 'file1.html', 'file2.html', 'file3.html', 'file4.html' ]
        for (let i = 0; i < files.length; i++) {
            await storage.put(`${directoryName}/${files[i]}`, i + '')
        }
        const refreshStorage = new FsStorage(`${basePath}/${directoryName}`)

        await refreshStorage.refresh()

        const result = await storage.exists(directoryName)

        expect(result).toBe(false)


    })

    it('ファイルをコピーする', async () => {

        await storage.copy('copy-folder/copy.html', 'copy-folder/copy2.html')
        const result = await storage.exists('copy-folder/copy2.html')
        expect(result).toBe(true)
        await storage.remove('copy-folder/copy2.html')

    })

    it('フォルダをコピーする', async () => {

        await storage.copy('copy-folder', 'copy-folder2')
        const check1 = await storage.exists('copy-folder2')
        const check2 = await storage.exists('copy-folder2/copy.html')
        const check3 = await storage.exists('copy-folder2/copy.css')
        expect(check1).toBe(true)
        expect(check2).toBe(true)
        expect(check3).toBe(true)

        const copyFolder = new FsStorage(`${basePath}/copy-folder2`)
        await copyFolder.refresh()

    })

    it('ファイルが存在するか確認する', async () => {

        const result = await storage.exists('index.html')
        expect(result).toBe(true)

    })

    it('フォルダが存在するか確認する', async () => {

        const result = await storage.exists('copy-folder')
        expect(result).toBe(true)

    })


    it('フォルダ一覧の取得が正しくできるか確認する', async () => {
        const result = await storage.readDir('', true)
        console.log(result)
    })

})