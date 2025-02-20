import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export function registerGetVersionHandler(server) {
    server.tool("get-version", "Get UGS CLI version", async () => {
        const { stdout } = await execAsync('ugs --version');
        return {
            content: [{ type: "text", text: stdout.trim() }]
        };
    });
}
