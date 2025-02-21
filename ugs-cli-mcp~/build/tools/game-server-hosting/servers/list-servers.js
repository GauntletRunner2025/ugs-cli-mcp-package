import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerListServers(server) {
    server.tool("list-servers", "List all servers", {
        "fleetId": z.string().optional().describe("Filter servers by fleet ID"),
        "buildConfigurationId": z.string().optional().describe("Filter servers by build configuration ID"),
        "status": z.string().optional().describe("Filter servers by status")
    }, async ({ fleetId, buildConfigurationId, status }) => {
        try {
            let command = `ugs gsh server list`;
            if (fleetId) {
                command += ` --fleet-id ${fleetId}`;
            }
            if (buildConfigurationId) {
                command += ` --build-configuration-id ${buildConfigurationId}`;
            }
            if (status) {
                command += ` --status ${status}`;
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
