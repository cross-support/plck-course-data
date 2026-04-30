import { describe, it, expect } from 'vitest'
import {MockStorage} from "../../../plck/storage/MockStorage";

describe('ファイル取得', () => {

    const storage = new MockStorage({
        'index.html': 'this is html.',
        'fetch-all/test.a.css': '',
        'fetch-all/test.a.html': '',
        'fetch-all/test.b.css': '',
        'fetch-all/test.b.html': '',
    })

    it('一つのファイルを取得する', async () => {

        // eslint-disable-next-line no-undef
        const file = await storage.get('index.html')
        expect(file).toBe('this is html.')

    })

    it('複数のファイルを取得する', async () => {

        const files = await storage.getAll('fetch-all/**/*')
        const fileNames = Object.keys(files)
        expect(fileNames.length).toBe(4)
        expect(fileNames[0]).toBe('test.a.css')
        expect(fileNames[1]).toBe('test.a.html')
        expect(fileNames[2]).toBe('test.b.css')
        expect(fileNames[3]).toBe('test.b.html')

    })

    it('複数のファイルを取得する - 特定のファイルのみ', async () => {

        const files = await storage.getAll('fetch-all/**/*.css')
        const fileNames = Object.keys(files)
        expect(fileNames.length).toBe(2)
        expect(fileNames[0]).toBe('test.a.css')
        expect(fileNames[1]).toBe('test.b.css')

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

        const refreshStorage = new MockStorage({
            'index.html': 'test'
        })

        await refreshStorage.refresh()

        const result = await refreshStorage.exists('index.html')

        expect(result).toBe(false)


    })

})