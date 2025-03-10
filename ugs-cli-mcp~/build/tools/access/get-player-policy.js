import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerGetPlayerPolicy(server) {
    server.tool("get-player-policy", "Get a player policy", {
        "playerId": z.string().describe("The ID of the player whose policy to get"),
        "policyId": z.string().describe("The ID of the policy to get")
    }, async ({ playerId, policyId }) => {
        try {
            const command = `ugs access get-player-policy ${playerId} ${policyId}`;
            const { stdout, stderr } = await execAsync(command);
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
