import { FutureData } from "../../data/api-futures";
import { Log } from "../../domain/entities/Log";

export interface LoggerRepository {
    log(log: Log): FutureData<void>;
    logMultiple(logs: Log[]): FutureData<void>;
}
