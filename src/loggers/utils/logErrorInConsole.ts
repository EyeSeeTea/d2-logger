import { getErrorMessage } from "./getErrorMessage";

export function logErrorInConsole(error: unknown, contextMessage: string): void {
    const date = new Date().toISOString();
    const errorMessage = getErrorMessage(error);
    console.error(`[ERROR] [${date}] (d2-logger) ${contextMessage}: ${errorMessage}\n`);
}
