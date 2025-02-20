import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerDisablePlayer(server) {
    server.tool("disable-player", "Disable an existing player account", {
        "playerId": z.string().describe("The ID of the player to disable")
    }, async ({ playerId }) => {
        try {
            const { stdout, stderr } = await execAsync(`ugs player disable ${playerId}`);
            return {
                content: [{ type: "text", text: stdout.trim() || `Error: ${stderr}` }]
            };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Error: ${error?.message || String(error)}` }]
            };
        }
    });
}
