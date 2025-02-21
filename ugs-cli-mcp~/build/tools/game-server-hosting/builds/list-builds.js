import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export function registerListBuilds(server) {
    server.tool("list-builds", "List all builds", {}, async () => {
        try {
            const command = `ugs gsh build list`;
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
