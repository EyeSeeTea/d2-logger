import path from "path";
import { run, subcommands } from "cmd-ts";

import * as programLogger from "./commands/programLogger";
import * as consoleLogger from "./commands/consoleLogger";
import * as trackerProgramLogger from "./commands/trackerProgramLogger";

export function runCli() {
    const cliSubcommands = subcommands({
        name: path.basename(__filename),
        cmds: {
            programLogger: programLogger.getCommand(),
            consoleLogger: consoleLogger.getCommand(),
            trackerProgramLogger: trackerProgramLogger.getCommand(),
        },
    });

    const args = process.argv.slice(2);
    run(cliSubcommands, args);
}
