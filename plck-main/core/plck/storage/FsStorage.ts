import IStorage from "./IStorage";
import { glob } from 'glob'
import { basename, dirname } from 'node:path'
const fs = require('node:fs').promises

export class FsStorage implements IStorage {

    basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath
    }

    async copy(fileName: string, dest: string, global: boolean = false): Promise<void> {
        const destPath = global ? dest : `${this.basePath}/${dest}`
        await fs.cp(`${this.basePath}/${fileName}`, destPath, { recursive: true })
    }

    /**
     *
     * @param fileName
     */
    async get(fileName: string): Promise<string> {
        return this._get(fileName)
    }

    private async _get(fileName: string, noBase = false): Promise<string> {
        const path = noBase ? `${fileName}` : `${this.basePath}/${fileName}`
        const options = { encoding: 'utf-8' as null }
        const string = await fs.readFile(path, options)
            .catch((e) => {
                console.log(e)
                if (e.code === 'ENOENT') {
                    return null
                } else {
                    throw e
                }
            }) as string
        return string
    }

    async getAll(pathName: string): Promise<{ [p: string]: string }> {
        const result = {}
        const filePaths = await glob(`${this.basePath}/${pathName}`)
        // console.log({ filePaths, pathName, basePath: this.basePath })
        for (let i = 0; i < filePaths.length; i++) {
            const path = filePaths[i]
            const fileStr = await this._get(path, true)
            const baseName = basename(path)
            result[baseName] = fileStr
        }
        return result
    }

    async put(fileName: string, content: string): Promise<void> {
        //
        const fullFileName = `${this.basePath}/${fileName}`
        const directory = dirname(fullFileName)

        await fs.mkdir(directory, { recursive: true })
        await fs.writeFile(fullFileName, content)
    }

    async refresh(): Promise<void> {
        await fs.rm(`${this.basePath}`, { recursive: true })
    }

    async remove(fileName: string): Promise<void> {
        await fs.rm(`${this.basePath}/${fileName}`)
    }

    async exists(fileName: string): Promise<boolean> {
        try {
            return !!(await fs.lstat(`${this.basePath}/${fileName}`))
        } catch (e) {
            return false
        }
    }

    async readDir(fileName: string, dirOnly: boolean): Promise<string[]> {
        const list = await fs.readdir(`${this.basePath}/${fileName}`, {withFileTypes: true})

        if (dirOnly) {
            return list.reduce((newList, file) => {
                if (file.isDirectory()) {
                    newList.push(file.name)
                }
                return newList
            }, [])
        }
        return list.map(dirent => dirent.name)
    }




}