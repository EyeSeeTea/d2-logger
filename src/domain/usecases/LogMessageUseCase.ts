import { FutureData } from "../../data/api-futures";
import { Log } from "../../domain/entities/Log";
import { LoggerRepository } from "../../domain/repositories/LoggerRepository";

export class LogMessageUseCase {
    constructor(private loggerRepository: LoggerRepository) {}

    public execute(log: Log, isDebug?: boolean): FutureData<void> {
        return this.loggerRepository.log(log, isDebug);
    }
}
