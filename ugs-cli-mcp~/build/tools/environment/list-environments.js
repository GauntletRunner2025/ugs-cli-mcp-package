import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export function registerListEnvironments(server) {
    server.tool("list-environments", "List all environments", {}, async () => {
        try {
            const command = `ugs environment list`;
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
