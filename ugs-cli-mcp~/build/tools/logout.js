import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export function registerLogout(server) {
    server.tool("logout", "Log out from Unity Gaming Services", {}, async () => {
        try {
            const command = `ugs logout`;
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
