import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerUpsertProjectPolicy(server) {
    server.tool("upsert-project-policy", "Create or update a project policy", {
        "projectId": z.string().describe("The ID of the project whose policy to create or update"),
        "filePath": z.string().describe("Path to the policy file"),
        "policyId": z.string().optional().describe("ID for the policy")
    }, async ({ projectId, filePath, policyId }) => {
        try {
            let command = `ugs access upsert-project-policy ${projectId} ${filePath}`;
            if (policyId) {
                command += ` --policy-id ${policyId}`;
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
