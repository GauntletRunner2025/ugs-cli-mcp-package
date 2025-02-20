import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export function registerListPlayer(server) {
    server.tool("list-player", "Return a list of the project's players and their information", async () => {
        try {
            const { stdout, stderr } = await execAsync('ugs player list');
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
