import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export function registerGetAllPlayerPolicies(server) {
    server.tool("get-all-player-policies", "Get all player policies", async ({}) => {
        try {
            const command = `ugs access get-all-player-policies`;
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
