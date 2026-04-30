import {SuspendData} from "./SuspendData";
import {ControllerData} from "./repository.type";

export default interface IProseedsRepository {
    setCompleteUnit(): Promise<boolean>
    getControllerData(): Promise<ControllerData>
    setSuspendData(suspendData: SuspendData): Promise<boolean>
    getSuspendData(): Promise<SuspendData>
}