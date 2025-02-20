import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerDeleteModule(server) {
    server.tool("delete-module", "Delete a Cloud-Code module", {
        "moduleName": z.string().describe("Name of the target module to delete")
    }, async ({ moduleName }) => {
        try {
            const { stdout, stderr } = await execAsync(`ugs cloud-code modules delete ${moduleName}`);
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
