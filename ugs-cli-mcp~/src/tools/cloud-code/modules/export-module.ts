import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerExportModule(server: McpServer) {
    server.tool(
        "export-module",
        "Export a Cloud-Code module",
        {
            "moduleName": z.string().describe("Name of the module to export"),
            "outputPath": z.string().optional().describe("Path where the module will be exported")
        },
        async ({ moduleName, outputPath }) => {
            try {
                const pathArg = outputPath ? ` --path ${outputPath}` : '';
                const { stdout, stderr } = await execAsync(`ugs cloud-code modules export ${moduleName}${pathArg}`);
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
