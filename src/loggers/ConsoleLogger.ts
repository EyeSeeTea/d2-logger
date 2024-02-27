import { Logger } from "..";
import { MessageType } from "../domain/entities/Log";
import { LoggerRepository } from "../domain/repositories/LoggerRepository";
import { LogMessageUseCase } from "../domain/usecases/LogMessageUseCase";
import { ConsoleLoggerRepository } from "../data/repositories/ConsoleLoggerRepository";

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

    private log(content: string, messageType: MessageType): Promise<void> {
        if (this.loggerRepository) {
            return new LogMessageUseCase(this.loggerRepository)
                .execute({ message: content, messageType: messageType })
                .toPromise();
        } else {
            throw new Error(`Logger not initialized properly. Please check configuration.`);
        }
    }
}
