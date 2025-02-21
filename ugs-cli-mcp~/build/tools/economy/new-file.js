import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerNewFile(server) {
    server.tool("new-economy-file", "Create a new Economy configuration file", {
        "name": z.string().describe("Name of the configuration file"),
        "path": z.string().optional().describe("Path where the file will be created"),
        "template": z.string().optional().describe("Template to use for the configuration file")
    }, async ({ name, path, template }) => {
        try {
            let command = `ugs economy new-file ${name}`;
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
