import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerListScripts(server) {
    server.tool("list-scripts", "List all Cloud-Code scripts in a module", {
        "moduleName": z.string().describe("Name of the module to list scripts from"),
        "filter": z.string().optional().describe("Filter scripts by name"),
        "limit": z.number().optional().describe("Maximum number of scripts to return"),
        "skip": z.number().optional().describe("Number of scripts to skip")
    }, async ({ moduleName, filter, limit, skip }) => {
        try {
            let command = `ugs cloud-code scripts list --module ${moduleName}`;
            if (filter) {
                command += ` --filter ${filter}`;
            }
            if (limit !== undefined) {
                command += ` --limit ${limit}`;
            }
            if (skip !== undefined) {
                command += ` --skip ${skip}`;
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
