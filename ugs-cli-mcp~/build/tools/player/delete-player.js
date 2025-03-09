import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
import { writeToLog, LogType } from "../../utils/logger.js";
const execAsync = promisify(exec);
export function registerDeletePlayer(server) {
    server.tool("delete-player", "Delete an existing player account", {
        "playerId": z.string().describe("The ID of the player to delete")
    }, async ({ playerId }) => {
        try {
            const { stdout, stderr } = await execAsync(`ugs player delete ${playerId} --json`);
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
