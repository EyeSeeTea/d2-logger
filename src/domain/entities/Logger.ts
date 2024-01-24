import { LoggerConfig } from "./LoggerConfig";

export type InitLoggerFunction = (config: LoggerConfig) => Promise<void>;
export type LogMessageFunction = (message: string) => Promise<void>;

export type Logger = {
    init: InitLoggerFunction;
    debug: LogMessageFunction;
    info: LogMessageFunction;
    success: LogMessageFunction;
    warn: LogMessageFunction;
    error: LogMessageFunction;
};
