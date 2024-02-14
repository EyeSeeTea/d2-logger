import { boolean, command, flag, option, optional, string, subcommands } from "cmd-ts";
import { AuthString, getD2ApiFromArgs } from "../common";
import { TrackerProgramContent, initLogger } from "../..";

export function getCommand() {
    const trackerProgramLogger = command({
        name: "Tracker program Logger example",
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
            trackerProgramId: option({
                type: string,
                long: "program",
                description: "Tracker program Id where register the logs",
            }),
            trackedEntityId: option({
                type: string,
                long: "tracked-entity",
                description: "Id of the tracked entity where to create the event",
            }),
            programStageId: option({
                type: string,
                long: "program-stage",
                description: "Id of the program stage where to create the event",
            }),
            enrollmentId: option({
                type: string,
                long: "enrollment",
                description: "Id of the enrollment where to create the event",
            }),
            messageId: option({
                type: string,
                long: "message",
                description: "Data Element Id of the Data Value of the event to be logged",
            }),
            messageTypeId: option({
                type: optional(string),
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
            const {
                url,
                auth,
                trackerProgramId,
                trackedEntityId,
                programStageId,
                enrollmentId,
                messageTypeId,
                messageId,
                debug,
            } = args;
            try {
                const logger = await initLogger<TrackerProgramContent>({
                    type: "trackerProgram",
                    debug: debug,
                    baseUrl: url,
                    auth: auth,
                    trackerProgramId: trackerProgramId,
                    messageTypeId: messageTypeId,
                });

                logger.info({
                    config: {
                        trackedEntityId: trackedEntityId,
                        programStageId: programStageId,
                        enrollmentId: enrollmentId,
                    },
                    messages: [{ id: messageId, value: "START: Getting DHIS2 instance info" }],
                });
                const api = getD2ApiFromArgs(args);
                const info = await api.system.info.getData();
                logger.success({
                    config: {
                        trackedEntityId: trackedEntityId,
                        programStageId: programStageId,
                        enrollmentId: enrollmentId,
                        eventStatus: "COMPLETED",
                    },
                    messages: [{ id: messageId, value: JSON.stringify(info) }],
                });
            } catch (e) {
                console.error(e);
            }
        },
    });

    return subcommands({
        name: "Tracker program Logger example",
        cmds: { log: trackerProgramLogger },
    });
}
