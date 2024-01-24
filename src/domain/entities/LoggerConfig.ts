import { Id } from "./Base";

type Auth = {
    username: string;
    password: string;
};

export type LoggerConfig = {
    baseUrl: string;
    auth: Auth;
    programId: Id;
    loggerDataElements: LoggerDataElements;
    organisationUnitId: Id;
};

export type LoggerDataElements = {
    messageId: Id;
    messageTypeId: Id;
};
