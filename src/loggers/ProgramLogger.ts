import { Logger } from "..";
import { DefaultLog, MessageType } from "../domain/entities/Log";
import { ProgramLoggerConfig } from "../domain/entities/LoggerConfig";
import { LoggerRepository } from "../domain/repositories/LoggerRepository";
import { CheckConfigProgramLoggerUseCase } from "../domain/usecases/CheckConfigProgramLoggerUseCase";
import { LogMessageUseCase } from "../domain/usecases/LogMessageUseCase";
import { ProgramD2Repository } from "../data/repositories/ProgramD2Repository";
import { ProgramLoggerD2Repository } from "../data/repositories/ProgramLoggerD2Repository";
import { LogMultipleMessageUseCase } from "../domain/usecases/LogMultipleMessageUseCase";
import { MultipleLogContent } from "../domain/entities/MultipleLogContent";

export class ProgramLogger implements Logger<string> {
    private constructor(private loggerRepository: LoggerRepository, private isDebug?: boolean) {}

    static async create(config: ProgramLoggerConfig): Promise<ProgramLogger> {
        const isConfigOk = await new CheckConfigProgramLoggerUseCase(new ProgramD2Repository())
            .execute(config)
            .toPromise();
        if (isConfigOk) {
            const loggerRepository = new ProgramLoggerD2Repository(config);
            await loggerRepository.init();
            return new ProgramLogger(loggerRepository, config.debug);
        } else {
            throw new Error(
                `Logger not initialized properly. Please check program and data elements configuration.`
            );
        }
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
        return this.logMultipleMessages(content);
    }

    private log(content: string, messageType: MessageType): Promise<void> {
        if (this.loggerRepository) {
            const options = { isDebug: this.isDebug };
            const log = this.mapContentToLog(content, messageType);
            return new LogMessageUseCase(this.loggerRepository).execute(log, options).toPromise();
        } else {
            throw new Error(`Logger not initialized properly. Please check configuration.`);
        }
    }

    private logMultipleMessages(content: MultipleLogContent): Promise<void> {
        if (this.loggerRepository) {
            const options = { isDebug: this.isDebug };
            const logs = content.map(({ content, messageType }) =>
                this.mapContentToLog(content, messageType)
            );
            return new LogMultipleMessageUseCase(this.loggerRepository)
                .execute(logs, options)
                .toPromise();
        } else {
            throw new Error(`Logger not initialized properly. Please check configuration.`);
        }
    }

    private mapContentToLog(content: string, messageType: MessageType): DefaultLog {
        return { message: content, messageType: messageType };
    }
}
