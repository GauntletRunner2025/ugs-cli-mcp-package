import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export function registerListBuildConfigurations(server) {
    server.tool("list-build-configurations", "List all build configurations", {}, async () => {
        try {
            const command = `ugs gsh build-configuration list`;
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
