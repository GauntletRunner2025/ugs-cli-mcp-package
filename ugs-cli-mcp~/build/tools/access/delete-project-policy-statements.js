import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerDeleteProjectPolicyStatements(server) {
    server.tool("delete-project-policy-statements", "Delete project policy statements", {
        "projectId": z.string().describe("The ID of the project whose policy statements to delete"),
        "statements": z.array(z.string()).describe("The IDs of the statements to delete")
    }, async ({ projectId, statements }) => {
        try {
            const command = `ugs access delete-project-policy-statements ${projectId} ${statements.join(' ')}`;
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
