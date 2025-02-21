import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerGetPublished(server) {
    server.tool("get-published", "Get published Economy configuration", {
        "output": z.string().optional().describe("Path to save the configuration file")
    }, async ({ output }) => {
        try {
            let command = `ugs economy get-published`;
            if (output) {
                command += ` --output ${output}`;
            }
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
