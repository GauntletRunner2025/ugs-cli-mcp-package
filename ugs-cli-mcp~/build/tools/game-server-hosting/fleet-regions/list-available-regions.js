import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export function registerListAvailableRegions(server) {
    server.tool("list-available-regions", "List available fleet regions", {}, async () => {
        try {
            const command = `ugs gsh fleet-region available`;
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
