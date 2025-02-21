import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerUpdateBuild(server) {
    server.tool("update-build", "Update a build", {
        "buildId": z.string().describe("ID of the build to update"),
        "name": z.string().optional().describe("New name for the build"),
        "notes": z.string().optional().describe("New notes for the build")
    }, async ({ buildId, name, notes }) => {
        try {
            let command = `ugs gsh build update ${buildId}`;
            if (name) {
                command += ` --name ${name}`;
            }
            if (notes) {
                command += ` --notes "${notes}"`;
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
