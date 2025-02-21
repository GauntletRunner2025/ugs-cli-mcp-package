import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerGetCoreDump(server) {
    server.tool("get-core-dump", "Get information about a core dump", {
        "coreDumpId": z.string().describe("ID of the core dump")
    }, async ({ coreDumpId }) => {
        try {
            const command = `ugs gsh core-dump get ${coreDumpId}`;
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
