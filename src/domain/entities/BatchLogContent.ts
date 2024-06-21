import { MessageType } from "./Log";

type LogContent = { content: string; messageType: MessageType };
export type BatchLogContent = LogContent[];
