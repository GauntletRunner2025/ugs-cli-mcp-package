import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export function registerLoginHandler(server) {
    server.tool("login", "Log into Unity UGS terminal with service account credentials from dashboard", {
        "service-key-id": z.string(),
        "secret": z.string()
    }, async ({ "service-key-id": serviceKeyId, "secret": secret }) => {
        // Use PowerShell command that we verified works
        const command = `powershell -Command "Write-Output '${secret}' | ugs login --service-key-id ${serviceKeyId} --secret-key-stdin"`;
        try {
            const { stdout } = await execAsync(command);
            return {
                content: [{ type: "text", text: stdout.trim() }]
            };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `[Error]: ${error?.message || String(error)}` }]
            };
        }
    });
}
