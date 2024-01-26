import { FutureData } from "../../data/api-futures";
import { Log } from "../../domain/entities/Log";
import { LoggerRepository } from "../../domain/repositories/LoggerRepository";

export class LogMessageUseCase {
    constructor(private loggerRepository: LoggerRepository) {}

    public execute(log: Log, isDebug?: boolean): FutureData<void> {
        if (isDebug) {
            // eslint-disable-next-line no-console
            console.log(log);
        }
        return this.loggerRepository.log(log);
    }
}
