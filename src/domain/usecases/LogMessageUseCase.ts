import { FutureData } from "../../data/api-futures";
import { Log } from "../../domain/entities/Log";
import { LoggerRepository } from "../../domain/repositories/LoggerRepository";

export class LogMessageUseCase {
    constructor(private loggerRepository: LoggerRepository) {}

    public execute(log: Log, options?: { isDebug?: boolean }): FutureData<void> {
        if (options?.isDebug) {
            console.debug(log);
        }
        return this.loggerRepository.log(log);
    }
}
