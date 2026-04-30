import IStorage from "./IStorage";
import {minimatch} from "minimatch";
import path from 'node:path'

export class MockStorage implements IStorage {

    private object: {};
    basePath: string;

    constructor(object: {}) {
        this.object = object
        this.basePath = ''
    }


    async copy(fileName: string, dest: string, global: boolean = false): Promise<void> {
        this.object[dest] = this.object[fileName]
    }

    async exists(fileName: string): Promise<boolean> {
        return !!this.object[fileName]
    }

    async get(fileName: string): Promise<string> {
        return this.object[fileName]
    }

    async getAll(pathName: string): Promise<{ [p: string]: string }> {
        const result = {}
        Object.keys(this.object).forEach(key => {
            if (minimatch(key, pathName)) {
                result[path.basename(key)] = this.object[key]
            }
        })
        return result
    }

    async put(fileName: string, content: string | Buffer): Promise<void> {
        this.object[fileName] = content
    }

    async refresh(): Promise<void> {
        this.object = {}
    }

    async remove(fileName: string): Promise<void> {
        if (this.object[fileName] !== undefined) {
            delete this.object[fileName]
        }
    }

    readDir(fileName: string, dirOnly: boolean): Promise<string[]> {
        const target = this.object[fileName]
        if (target) {
            const result = Object.keys(target)
            return Promise.resolve(result)
        }
        return Promise.resolve([]);
    }

}