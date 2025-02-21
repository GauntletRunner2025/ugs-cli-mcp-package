import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export function registerListFleets(server) {
    server.tool("list-fleets", "List all fleets", {}, async () => {
        try {
            const command = `ugs gsh fleet list`;
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
