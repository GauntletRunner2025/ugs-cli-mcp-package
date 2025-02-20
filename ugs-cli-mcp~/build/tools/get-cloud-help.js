import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export function registerGetCloudHelpHandler(server) {
    server.tool("get-cloud-save-help", "Get help information on the cloud save service", async () => {
        const { stdout } = await execAsync('ugs cloud-save -h');
        return {
            content: [{ type: "text", text: stdout.trim() }]
        };
    });
}
