import { FutureData } from "../../data/api-futures";
import { Log } from "../../domain/entities/Log";
import { LoggerConfig } from "../../domain/entities/LoggerConfig";

export interface LoggerRepository {
    init(config: LoggerConfig): FutureData<void>;
    log(log: Log): FutureData<void>;
}
