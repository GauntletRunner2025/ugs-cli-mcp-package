import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerGetModule(server) {
    server.tool("get-module", "Get information about a specific Cloud-Code module", {
        "moduleName": z.string().describe("Name of the module to get information about")
    }, async ({ moduleName }) => {
        try {
            const { stdout, stderr } = await execAsync(`ugs cloud-code modules get ${moduleName}`);
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
