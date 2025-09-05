import { Logger, TrackerProgramContent } from "..";
import { MessageType, TrackerProgramLog } from "../domain/entities/Log";
import { TrackerProgramLoggerConfig } from "../domain/entities/LoggerConfig";
import { LoggerRepository } from "../domain/repositories/LoggerRepository";
import { CheckConfigProgramLoggerUseCase } from "../domain/usecases/CheckConfigProgramLoggerUseCase";
import { LogMessageUseCase } from "../domain/usecases/LogMessageUseCase";
import { TrackerProgramD2Repository } from "../data/repositories/TrackerProgramD2Repository";
import { TrackerProgramLoggerD2Repository } from "../data/repositories/TrackerProgramLoggerD2Repository";
import { BatchLogContent } from "../domain/entities/BatchLogContent";
import { logErrorInConsole } from "./utils/logErrorInConsole";

// TODO: homogenize the use of Promises or Futures
export class TrackerProgramLogger implements Logger<TrackerProgramContent> {
    private constructor(private loggerRepository: LoggerRepository, private isDebug?: boolean) {}

    static async create(config: TrackerProgramLoggerConfig): Promise<TrackerProgramLogger> {
        const isConfigOk = await new CheckConfigProgramLoggerUseCase(
            new TrackerProgramD2Repository()
        )
            .execute(config)
            .toPromise()
            .catch(error => {
                throw new Error(
                    `Error checking program configuration for program with id ${
                        config.trackerProgramId
                    }: ${error instanceof Error ? error.message : String(error)}`
                );
            });

        if (isConfigOk) {
            const loggerRepository = new TrackerProgramLoggerD2Repository(config);
            return new TrackerProgramLogger(loggerRepository, config.debug);
        } else {
            throw new Error(
                `Logger not initialized properly. Please check program and data elements configuration.`
            );
        }
    }

    debug(content: TrackerProgramContent): Promise<void> {
        return this.log(content, "Debug");
    }

    info(content: TrackerProgramContent): Promise<void> {
        return this.log(content, "Info");
    }

    success(content: TrackerProgramContent): Promise<void> {
        return this.log(content, "Success");
    }

    warn(content: TrackerProgramContent): Promise<void> {
        return this.log(content, "Warn");
    }

    error(content: TrackerProgramContent): Promise<void> {
        return this.log(content, "Error");
    }

    // TODO: implement batchLog method
    batchLog(_content: BatchLogContent): Promise<void> {
        throw new Error("Method not implemented in Tracker Program Logger yet");
    }

    private log(content: TrackerProgramContent, messageType: MessageType): Promise<void> {
        const options = { isDebug: this.isDebug };
        const log = this.mapContentToLog(content, messageType);
        return new LogMessageUseCase(this.loggerRepository)
            .execute(log, options)
            .toPromise()
            .catch((error: unknown) => {
                logErrorInConsole(error, "Error while logging message");
            });
    }

    private mapContentToLog(
        content: TrackerProgramContent,
        messageType: MessageType
    ): TrackerProgramLog {
        const { config, messages } = content;
        return {
            config: config,
            messages: messages,
            messageType: messageType,
        };
    }
}
