export type Log = {
    message: string;
    messageType: MessageType;
};

export type MessageType = "Debug" | "Info" | "Success" | "Warn" | "Error";
