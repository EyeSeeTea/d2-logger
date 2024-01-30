import { FutureData } from "../../data/api-futures";
import { LoggerConfig } from "../../domain/entities/LoggerConfig";

export interface ProgramRepository {
    checkConfig(config: LoggerConfig): FutureData<boolean>;
}
