import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerExportScript(server: McpServer) {
    server.tool(
        "export-script",
        "Export a Cloud-Code script to a file",
        {
            "name": z.string().describe("Name of the script to export"),
            "moduleName": z.string().describe("Name of the module containing the script"),
            "outputPath": z.string().optional().describe("Path where the script will be exported")
        },
        async ({ name, moduleName, outputPath }) => {
            try {
                let command = `ugs cloud-code scripts export ${name} --module ${moduleName}`;
                if (outputPath) {
                    command += ` --path ${outputPath}`;
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
