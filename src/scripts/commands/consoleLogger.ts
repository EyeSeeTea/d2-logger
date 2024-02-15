import { boolean, command, flag, option, string, subcommands } from "cmd-ts";
import { AuthString, getD2ApiFromArgs } from "../common";
import { initLogger } from "../..";

export function getCommand() {
    const consoleLogger = command({
        name: "Console Logger example",
        description: "Log DHIS2 instance info in console",
        args: {
            url: option({
                type: string,
                long: "url",
                description: "http[s]://HOST:PORT",
            }),
            auth: option({
                type: AuthString,
                long: "auth",
                description: "USERNAME:PASSWORD",
            }),
            debug: flag({
                type: boolean,
                long: "debug",
                description: "Option to print also logs in console",
            }),
        },
        handler: async args => {
            try {
                const logger = await initLogger({
                    type: "console",
                });

                logger.info("START: Getting DHIS2 instance info");
                const api = getD2ApiFromArgs(args);
                const info = await api.system.info.getData();
                logger.success(JSON.stringify(info));
            } catch (e) {
                console.error(e);
            }
        },
    });

    return subcommands({
        name: "Console Logger example",
        cmds: { log: consoleLogger },
    });
}
