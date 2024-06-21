import { DefaultLog, MessageType } from "../../domain/entities/Log";

export function mapContentToLog(content: string, messageType: MessageType): DefaultLog {
    return { message: content, messageType: messageType };
}
