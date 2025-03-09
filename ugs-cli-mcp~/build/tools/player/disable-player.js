import { exec } from "child_process";
import { promisify } from "util";
import { writeToLog, LogType } from "../../utils/logger.js";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerDisablePlayer(server) {
    server.tool("disable-player", "Disable an existing player account", {
        "playerId": z.string().describe("The ID of the player to disable")
    }, async ({ playerId }) => {
        try {
            const { stdout, stderr } = await execAsync(`ugs player disable ${playerId} --json`);
            // Log stdout and stderr separately
            if (stdout)
                await writeToLog(stdout, LogType.STDOUT);
            if (stderr)
                await writeToLog(stderr, LogType.STDERR);
            return {
                content: [{ type: "text", text: stderr }]
            };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Error: ${error?.message || String(error)}` }]
            };
        }
    });
}
