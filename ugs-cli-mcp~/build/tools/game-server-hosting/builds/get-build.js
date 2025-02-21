import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerGetBuild(server) {
    server.tool("get-build", "Get information about a build", {
        "buildId": z.string().describe("ID of the build")
    }, async ({ buildId }) => {
        try {
            const command = `ugs gsh build get ${buildId}`;
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
