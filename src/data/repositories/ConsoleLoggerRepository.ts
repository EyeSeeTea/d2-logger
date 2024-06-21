import { FutureData } from "../../data/api-futures";
import { Future } from "../../domain/entities/generic/Future";
import { DefaultLog } from "../../domain/entities/Log";
import { LoggerRepository } from "../../domain/repositories/LoggerRepository";

export class ConsoleLoggerRepository implements LoggerRepository {
    batchLog(logs: DefaultLog[]): FutureData<void> {
        const logs$ = logs.map(log => this.log(log));
        return Future.sequential(logs$).map(() => undefined);
    }

    log(log: DefaultLog): FutureData<void> {
        const { message, messageType } = log;
        return Future.success<Error, void>(undefined).tap(() => {
            const date = new Date().toISOString();
            process.stderr.write(`[${messageType.toUpperCase()}] [${date}] ${message}\n`);
        });
    }
}
