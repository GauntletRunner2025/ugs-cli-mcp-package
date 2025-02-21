import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerDeleteConfig(server) {
    server.tool("delete-config", "Delete a configuration key", {
        "key": z.string().describe("The configuration key to delete")
    }, async ({ key }) => {
        try {
            const command = `ugs config delete ${key}`;
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
