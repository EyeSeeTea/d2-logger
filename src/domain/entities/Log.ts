import { Id } from "./Base";

export type Log = DefaultLog | TrackerProgramLog;

export type DefaultLog = {
    message: string;
    messageType: MessageType;
};

export type MessageType = "Debug" | "Info" | "Success" | "Warn" | "Error";

export type TrackerProgramLog = {
    config: TrackerProgramMessageConfig;
    messageType: MessageType;
    messages: TrackerProgramMessages[];
};

export type TrackerProgramMessageConfig = {
    trackedEntityId: Id;
    programStageId: Id;
    enrollmentId: Id;
    eventStatus?: "ACTIVE" | "COMPLETED" | "VISITED" | "SCHEDULE" | "OVERDUE" | "SKIPPED";
};

export type TrackerProgramMessages = {
    id: Id;
    value: string;
};
