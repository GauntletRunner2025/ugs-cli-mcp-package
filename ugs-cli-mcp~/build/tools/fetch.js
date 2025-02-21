import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export function registerFetch(server) {
    server.tool("fetch", "Fetch the latest configuration for the active environment", {}, async () => {
        try {
            const command = `ugs fetch`;
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
