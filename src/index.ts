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

type LoggerType = {
    program: ProgramLogger;
    trackerProgram: TrackerProgramLogger;
    console: ConsoleLogger;
};

export async function initLogger<Config extends LoggerConfig>(
    config: Config
): Promise<LoggerType[Config["type"]]> {
    type Result = Promise<LoggerType[Config["type"]]>;

    switch (config.type) {
        case "program":
            return ProgramLogger.create(config) as Result;
        case "trackerProgram":
            return TrackerProgramLogger.create(config) as Result;
        case "console":
            return ConsoleLogger.create() as Result;
    }
}
