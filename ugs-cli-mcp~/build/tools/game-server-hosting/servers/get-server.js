import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerGetServer(server) {
    server.tool("get-server", "Get information about a server", {
        "serverId": z.string().describe("ID of the server")
    }, async ({ serverId }) => {
        try {
            const command = `ugs gsh server get ${serverId}`;
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
