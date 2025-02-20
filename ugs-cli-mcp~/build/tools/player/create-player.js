import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export function registerCreatePlayer(server) {
    server.tool("create-player", "Create an anonymous player account", async () => {
        try {
            const { stdout, stderr } = await execAsync('ugs player create');
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
