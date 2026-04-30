import {IRepository} from "@corePlck/components/repository/IRepository.ts";

export interface IRepositoryProvider {
    provide(repository: IRepository): Promise<void>
}