import { Id } from "./Base";

interface LoggerConfigBase {
    debug?: boolean;
}

export type LoggerConfig = ProgramLoggerConfig | ConsoleLoggerConfig;

export interface ConsoleLoggerConfig extends LoggerConfigBase {
    type: "console";
}

export interface ProgramLoggerConfig extends LoggerConfigBase {
    type: "program";
    baseUrl: string;
    auth: Auth;
    programId: Id;
    loggerDataElements: LoggerDataElements;
    organisationUnitId?: Id;
}

type Auth = {
    username: string;
    password: string;
};

export type LoggerDataElements = {
    messageId: Id;
    messageTypeId: Id;
};
