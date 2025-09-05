import { Logger } from "..";
import { MessageType } from "../domain/entities/Log";
import { LoggerRepository } from "../domain/repositories/LoggerRepository";
import { LogMessageUseCase } from "../domain/usecases/LogMessageUseCase";
import { ConsoleLoggerRepository } from "../data/repositories/ConsoleLoggerRepository";
import { BatchLogMessageUseCase } from "../domain/usecases/BatchLogMessageUseCase";
import { BatchLogContent } from "../domain/entities/BatchLogContent";
import { mapContentToLog } from "./utils/mapContentToLog";
import { logErrorInConsole } from "./utils/logErrorInConsole";

// TODO: homogenize the use of Promises or Futures
export class ConsoleLogger implements Logger<string> {
    private constructor(private loggerRepository: LoggerRepository) {}

    static async create(): Promise<ConsoleLogger> {
        const loggerRepository = new ConsoleLoggerRepository();
        return new ConsoleLogger(loggerRepository);
    }

    debug(content: string): Promise<void> {
        return this.log(content, "Debug");
    }

    info(content: string): Promise<void> {
        return this.log(content, "Info");
    }

    success(content: string): Promise<void> {
        return this.log(content, "Success");
    }

    warn(content: string): Promise<void> {
        return this.log(content, "Warn");
    }

    error(content: string): Promise<void> {
        return this.log(content, "Error");
    }

    batchLog(content: BatchLogContent): Promise<void> {
        const logs = content.map(content => mapContentToLog(content.content, content.messageType));
        return new BatchLogMessageUseCase(this.loggerRepository)
            .execute(logs)
            .toPromise()
            .catch((error: unknown) => {
                logErrorInConsole(error, "Error while processing batch logs");
            });
    }

    private log(content: string, messageType: MessageType): Promise<void> {
        return new LogMessageUseCase(this.loggerRepository)
            .execute({ message: content, messageType: messageType })
            .toPromise()
            .catch((error: unknown) => {
                logErrorInConsole(error, "Error while logging message");
            });
    }
}
