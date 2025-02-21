import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerImportScript(server: McpServer) {
    server.tool(
        "import-script",
        "Import a Cloud-Code script from a file",
        {
            "filePath": z.string().describe("Path to the script file to import"),
            "moduleName": z.string().describe("Name of the module to import the script into"),
            "name": z.string().optional().describe("Optional name for the imported script"),
            "overwrite": z.boolean().optional().describe("Whether to overwrite an existing script with the same name")
        },
        async ({ filePath, moduleName, name, overwrite }) => {
            try {
                let command = `ugs cloud-code scripts import ${filePath} --module ${moduleName}`;
                if (name) {
                    command += ` --name ${name}`;
                }
                if (overwrite) {
                    command += ` --overwrite`;
                }
                
                const { stdout, stderr } = await execAsync(command);
                return {
                    content: [{ type: "text", text: stdout.trim() || `Error: ${stderr}` }]
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Error: ${error?.message || String(error)}` }]
                };
            }
        }
    );
}
