import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerDeleteEnvironment(server) {
    server.tool("delete-environment", "Delete an environment", {
        "name": z.string().describe("Name of the environment to delete")
    }, async ({ name }) => {
        try {
            const command = `ugs environment delete ${name}`;
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
