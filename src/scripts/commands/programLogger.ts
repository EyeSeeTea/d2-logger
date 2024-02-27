import { boolean, command, flag, option, string, subcommands } from "cmd-ts";
import { AuthString, getD2ApiFromArgs } from "../common";
import { ProgramLogger, initLogger } from "../..";

export function getCommand() {
    const programLogger = command({
        name: "Program Logger example",
        description: "Log DHIS2 instance info in a program of DHIS2",
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
            orgUnitId: option({
                type: string,
                long: "org-unit",
                description: "Organization Unit Id to register the logs",
            }),
            programId: option({
                type: string,
                long: "program",
                description: "Event program Id where register the logs",
            }),
            messageId: option({
                type: string,
                long: "message",
                description: "Id of the data element which is the message",
            }),
            messageTypeId: option({
                type: string,
                long: "types",
                description: "Id of the data element which is the types of message",
            }),
            debug: flag({
                type: boolean,
                long: "debug",
                description: "Option to print also logs in console",
            }),
        },
        handler: async args => {
            const { url, auth, orgUnitId, programId, messageTypeId, messageId, debug } = args;
            try {
                const logger: ProgramLogger = await initLogger({
                    type: "program",
                    debug: debug,
                    baseUrl: url,
                    auth: auth,
                    organisationUnitId: orgUnitId,
                    programId: programId,
                    dataElements: {
                        messageId: messageId,
                        messageTypeId: messageTypeId,
                    },
                });

                await logger.info("START: Getting DHIS2 instance info");
                const api = getD2ApiFromArgs(args);
                const info = await api.system.info.getData();
                logger.success(JSON.stringify(info));
            } catch (e) {
                console.error(e);
            }
        },
    });

    return subcommands({
        name: "Program Logger example",
        cmds: { log: programLogger },
    });
}
