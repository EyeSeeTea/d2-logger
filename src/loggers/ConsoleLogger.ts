import { Logger } from "..";
import { DefaultLog, MessageType } from "../domain/entities/Log";
import { LoggerRepository } from "../domain/repositories/LoggerRepository";
import { LogMessageUseCase } from "../domain/usecases/LogMessageUseCase";
import { ConsoleLoggerRepository } from "../data/repositories/ConsoleLoggerRepository";
import { MultipleLogContent } from "../domain/entities/MultipleLogContent";
import { LogMultipleMessageUseCase } from "../domain/usecases/LogMultipleMessageUseCase";

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

    logMultiple(content: MultipleLogContent): Promise<void> {
        if (this.loggerRepository) {
            const logs = content.map(({ content, messageType }) =>
                this.mapContentToLog(content, messageType)
            );
            return new LogMultipleMessageUseCase(this.loggerRepository).execute(logs).toPromise();
        } else {
            throw new Error(`Logger not initialized properly. Please check configuration.`);
        }
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

    private mapContentToLog(content: string, messageType: MessageType): DefaultLog {
        return { message: content, messageType: messageType };
    }
}
