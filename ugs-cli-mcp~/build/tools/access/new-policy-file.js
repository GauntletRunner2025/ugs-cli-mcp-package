import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerNewPolicyFile(server) {
    server.tool("new-policy-file", "Create a new access policy file", {
        "name": z.string().describe("Name of the policy file to create"),
        "path": z.string().optional().describe("Path where the policy file will be created"),
        "template": z.string().optional().describe("Template to use for the policy file")
    }, async ({ name, path, template }) => {
        try {
            let command = `ugs access new-file ${name}`;
            if (path) {
                command += ` --path ${path}`;
            }
            if (template) {
                command += ` --template ${template}`;
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
