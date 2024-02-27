import { FutureData } from "../../data/api-futures";
import { ProgramRepository } from "../../domain/repositories/ProgramRepository";
import { LoggerConfig } from "../../domain/entities/LoggerConfig";

export class CheckConfigProgramLoggerUseCase {
    constructor(private loggerRepository: ProgramRepository) {}

    public execute(config: LoggerConfig): FutureData<boolean> {
        return this.loggerRepository.checkConfig(config);
    }
}
