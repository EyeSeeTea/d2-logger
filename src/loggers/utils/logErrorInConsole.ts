export function logErrorInConsole(error: unknown, contextMessage: string): void {
    const date = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ERROR] [${date}] (d2-logger) ${contextMessage}: ${errorMessage}\n`);
}
