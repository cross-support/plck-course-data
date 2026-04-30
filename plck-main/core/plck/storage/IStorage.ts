
export default interface IStorage {

    basePath: string

    get(fileName: string): Promise<string>

    /**
     * 指定したディレクトリのファイルを全て取得する処理
     * fast-glob形式のパスに対応
     * @param pathName
     */
    getAll(pathName: string): Promise<{ [key: string]: string }>

    /**
     * ファイルを保存する処理
     */
    put(fileName: string, content: string|Buffer): Promise<void>

    /**
     * ファイルをコピーする処理
     * @param fileName
     * @param dest
     * @param global
     */
    copy(fileName: string, dest: string, global: boolean): Promise<void>

    /**
     * 指定したファイルを削除する処理
     */
    remove(fileName: string): Promise<void>

    /**
     * 全てのファイルを削除する処理
     */
    refresh(): Promise<void>


    /**
     * ファイルが存在するか確認する
     * @param fileName
     */
    exists(fileName: string): Promise<boolean>

    /**
     * 指定したディレクトリ配下のディレクトリ名とファイル名を取得する
     * @param fileName
     * @param dirOnly ディレクトリのみを取得する
     */
    readDir(fileName: string, dirOnly: boolean): Promise<string[]>
}