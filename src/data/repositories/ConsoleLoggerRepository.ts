import { FutureData } from "../../data/api-futures";
import { Future } from "../../domain/entities/generic/Future";
import { DefaultLog } from "../../domain/entities/Log";
import { LoggerRepository } from "../../domain/repositories/LoggerRepository";

export class ConsoleLoggerRepository implements LoggerRepository {
    batchLog(logs: DefaultLog[]): FutureData<void> {
        logs.map(log => this.log(log));
        return Future.success(undefined);
    }

    log(log: DefaultLog): FutureData<void> {
        const { message, messageType } = log;
        const date = new Date().toISOString();
        process.stderr.write(`[${messageType.toUpperCase()}] [${date}] ${message}\n`);
        return Future.success(undefined);
    }
}
