import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerGetBuildConfiguration(server) {
    server.tool("get-build-configuration", "Get information about a build configuration", {
        "buildConfigurationId": z.string().describe("ID of the build configuration")
    }, async ({ buildConfigurationId }) => {
        try {
            const command = `ugs gsh build-configuration get ${buildConfigurationId}`;
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
