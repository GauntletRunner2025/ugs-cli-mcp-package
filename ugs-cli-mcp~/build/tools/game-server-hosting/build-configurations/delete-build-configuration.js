import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerDeleteBuildConfiguration(server) {
    server.tool("delete-build-configuration", "Delete a build configuration", {
        "buildConfigurationId": z.string().describe("ID of the build configuration to delete")
    }, async ({ buildConfigurationId }) => {
        try {
            const command = `ugs gsh build-configuration delete ${buildConfigurationId}`;
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
