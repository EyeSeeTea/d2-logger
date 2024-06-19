import { FutureData } from "../../data/api-futures";
import { Log } from "../../domain/entities/Log";
import { LoggerRepository } from "../../domain/repositories/LoggerRepository";

export class LogMultipleMessageUseCase {
    constructor(private loggerRepository: LoggerRepository) {}

    public execute(logs: Log[], options?: { isDebug?: boolean }): FutureData<void> {
        if (options?.isDebug) {
            // eslint-disable-next-line no-console
            console.log(logs);
        }
        return this.loggerRepository.logMultiple(logs);
    }
}
