import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerListRegionTemplates(server) {
    server.tool("list-region-templates", "List available fleet region templates", {
        "regionId": z.string().describe("ID of the region")
    }, async ({ regionId }) => {
        try {
            const command = `ugs gsh fleet-region templates ${regionId}`;
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
