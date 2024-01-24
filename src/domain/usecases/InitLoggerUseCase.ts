import { FutureData } from "../../data/api-futures";
import { LoggerRepository } from "../../domain/repositories/LoggerRepository";
import { LoggerConfig } from "../../domain/entities/LoggerConfig";

export class InitLoggerUseCase {
    constructor(private loggerRepository: LoggerRepository) {}

    public execute(config: LoggerConfig): FutureData<void> {
        return this.loggerRepository.init(config);
    }
}
