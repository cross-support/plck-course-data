export interface IRepository {
    create(): Promise<string>
}