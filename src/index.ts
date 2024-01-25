import { ProgramLoggerD2Repository } from "./data/repositories/ProgramLoggerD2Repository";
import { LoggerConfig, ProgramLoggerConfig } from "./domain/entities/LoggerConfig";
import { MessageType } from "./domain/entities/Log";
import { CheckConfigProgramLoggerUseCase } from "./domain/usecases/CheckConfigProgramLoggerUseCase";
import { LogMessageUseCase } from "./domain/usecases/LogMessageUseCase";
import { LoggerRepository } from "./domain/repositories/LoggerRepository";
import { ProgramRepository } from "./domain/repositories/ProgramRepository";
import { ProgramD2Repository } from "./data/repositories/ProgramD2Repository";
import { ConsoleLoggerRepository } from "./data/repositories/ConsoleLoggerRepository";

export class Logger {
    isDebug: boolean | undefined;
    programRepository: ProgramRepository | undefined;
    loggerRepository: LoggerRepository | undefined;

    async init(config: LoggerConfig): Promise<void> {
        this.isDebug = config.debug ?? false;
        switch (config.type) {
            case "program":
                return await this.configProgramLogger(config);
            case "console":
                return this.configConsoleLogger();
            default:
                return await this.configProgramLogger(config);
        }
    }

    debug(message: string): Promise<void> {
        return this.log(message, "Debug");
    }

    info(message: string): Promise<void> {
        return this.log(message, "Info");
    }

    success(message: string): Promise<void> {
        return this.log(message, "Success");
    }

    warn(message: string): Promise<void> {
        return this.log(message, "Warn");
    }

    error(message: string): Promise<void> {
        return this.log(message, "Error");
    }

    private log(message: string, messageType: MessageType): Promise<void> {
        if (this.loggerRepository) {
            return new LogMessageUseCase(this.loggerRepository)
                .execute({ message: message, messageType: messageType }, this.isDebug)
                .toPromise();
        } else {
            throw new Error(`Logger not initialized properly. Please check configuration.`);
        }
    }

    private async configProgramLogger(config: ProgramLoggerConfig): Promise<void> {
        this.programRepository = new ProgramD2Repository();
        const isConfigOk = await new CheckConfigProgramLoggerUseCase(this.programRepository)
            .execute(config)
            .toPromise();
        if (isConfigOk) {
            this.loggerRepository = new ProgramLoggerD2Repository(config);
        } else {
            throw new Error(
                `Logger not initialized properly. Please check program and data elements configuration.`
            );
        }
    }

    private configConsoleLogger(): void {
        this.loggerRepository = new ConsoleLoggerRepository();
    }
}
