import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export function registerStatus(server) {
    server.tool("status", "Show the current status of Unity Gaming Services CLI", {}, async () => {
        try {
            const command = `ugs status`;
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
