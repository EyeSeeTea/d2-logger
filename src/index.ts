import { Id } from "./domain/entities/Base";
import { LoggerConfig } from "./domain/entities/LoggerConfig";
import { ConsoleLogger } from "./loggers/ConsoleLogger";
import { ProgramLogger } from "./loggers/ProgramLogger";
import { TrackerProgramLogger } from "./loggers/TrackerProgramLogger";

export type TrackerProgramContent = {
    config: TrackerProgramMessageConfig;
    messages: TrackerProgramMessages[];
};

type TrackerProgramMessageConfig = {
    trackedEntityId: Id;
    programStageId: Id;
    enrollmentId: Id;
    eventStatus?: "ACTIVE" | "COMPLETED" | "VISITED" | "SCHEDULE" | "OVERDUE" | "SKIPPED";
};

type TrackerProgramMessages = {
    id: Id;
    value: string;
};

export interface Logger<T> {
    debug(content: T): Promise<void>;
    info(content: T): Promise<void>;
    success(content: T): Promise<void>;
    warn(content: T): Promise<void>;
    error(content: T): Promise<void>;
}

export async function initLogger<T>(config: LoggerConfig): Promise<Logger<T>> {
    switch (config.type) {
        case "program":
            return ProgramLogger.create(config) as Promise<Logger<T>>;
        case "trackerProgram":
            return TrackerProgramLogger.create(config) as Promise<Logger<T>>;
        case "console":
        default:
            return ConsoleLogger.create() as Promise<Logger<T>>;
    }
}
