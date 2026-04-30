import {IRepositoryProvider} from "./IRepositoryProvider";
import IStorage from "../../storage/IStorage";
import {IRepository} from "../../components/repository/IRepository.ts";

export class RepositoryProvider implements IRepositoryProvider {

    private readonly storage: IStorage;

    constructor(storage: IStorage) {
        this.storage = storage
    }

    async provide(repository: IRepository): Promise<void> {
        const text = await repository.create()
        await this.storage.put('repository.ts', text)

    }

}