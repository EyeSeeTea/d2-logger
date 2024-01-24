import { LoggerD2Repository } from "./data/repositories/LoggerD2Repository";
import { LoggerConfig } from "./domain/entities/LoggerConfig";
import { LoggerRepository } from "./domain/repositories/LoggerRepository";
import { InitLoggerUseCase } from "./domain/usecases/InitLoggerUseCase";
import { LogDebugMessageUseCase } from "./domain/usecases/LogDebugMessageUseCase";
import { LogErrorMessageUseCase } from "./domain/usecases/LogErrorMessageUseCase";
import { LogInfoMessageUseCase } from "./domain/usecases/LogInfoMessageUseCase";
import { LogSuccessMessageUseCase } from "./domain/usecases/LogSuccessMessageUseCase";
import { LogWarnMessageUseCase } from "./domain/usecases/LogWarnMessageUseCase";
import { Log, MessageType } from "./domain/entities/Log";
import { LogMessageFunction, Logger } from "./domain/entities/Logger";

type Repositories = {
    loggerRepository: LoggerRepository;
};

const repositories: Repositories = {
    loggerRepository: new LoggerD2Repository(),
};

async function initLogger(config: LoggerConfig): Promise<void> {
    return new InitLoggerUseCase(repositories.loggerRepository).execute(config).toPromise();
}

function getLogger(messageType: MessageType): LogMessageFunction {
    return function log(message: string): Promise<void> {
        const log: Log = { messageType: messageType, message: message };
        switch (messageType) {
            case "Debug":
                return new LogDebugMessageUseCase(repositories.loggerRepository)
                    .execute(log)
                    .toPromise();
            case "Info":
                return new LogInfoMessageUseCase(repositories.loggerRepository)
                    .execute(log)
                    .toPromise();
            case "Success":
                return new LogSuccessMessageUseCase(repositories.loggerRepository)
                    .execute(log)
                    .toPromise();
            case "Warn":
                return new LogWarnMessageUseCase(repositories.loggerRepository)
                    .execute(log)
                    .toPromise();
            case "Error":
                return new LogErrorMessageUseCase(repositories.loggerRepository)
                    .execute(log)
                    .toPromise();
            default:
                return new LogInfoMessageUseCase(repositories.loggerRepository)
                    .execute(log)
                    .toPromise();
        }
    };
}

const logger: Logger = {
    init: initLogger,
    debug: getLogger("Debug"),
    info: getLogger("Info"),
    success: getLogger("Success"),
    warn: getLogger("Warn"),
    error: getLogger("Error"),
};

export default logger;
