import { Maybe } from "../../utils/ts-utils";
import { Id } from "./Base";

interface LoggerConfigBase {
    debug?: boolean;
}

export type LoggerConfig = ProgramLoggerConfig | ConsoleLoggerConfig | TrackerProgramLoggerConfig;

export interface ConsoleLoggerConfig extends LoggerConfigBase {
    type: "console";
}

export interface ProgramLoggerConfig extends LoggerConfigBase {
    type: "program";
    baseUrl: string;
    auth: Maybe<Auth>;
    programId: Id;
    dataElements: DataElements;
    organisationUnitId: Id;
}

type Auth = {
    username: string;
    password: string;
};

export type DataElements = {
    messageId: Id;
    messageTypeId: Id;
};

export interface TrackerProgramLoggerConfig extends LoggerConfigBase {
    type: "trackerProgram";
    baseUrl: string;
    auth: Maybe<Auth>;
    trackerProgramId: Id;
    messageTypeId: Maybe<Id>;
}
