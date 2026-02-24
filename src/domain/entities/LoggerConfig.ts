import { D2ApiOptions } from "../../types/d2-api";
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
    d2ApiOptions: D2ApiOptions;
    programId: Id;
    dataElements: DataElements;
    organisationUnitId: Id;
}

export type DataElements = {
    messageId: Id;
    messageTypeId: Id;
};

export interface TrackerProgramLoggerConfig extends LoggerConfigBase {
    type: "trackerProgram";
    d2ApiOptions: D2ApiOptions;
    trackerProgramId: Id;
    messageTypeId: Maybe<Id>;
}
