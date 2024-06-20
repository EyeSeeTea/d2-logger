import { FutureData } from "../../data/api-futures";
import { Log } from "../entities/Log";
import { LoggerRepository } from "../repositories/LoggerRepository";

export class BatchLogMessageUseCase {
    constructor(private loggerRepository: LoggerRepository) {}

    public execute(logs: Log[], options?: { isDebug?: boolean }): FutureData<void> {
        if (options?.isDebug) {
            // eslint-disable-next-line no-console
            console.log(logs);
        }
        return this.loggerRepository.batchLog(logs);
    }
}
