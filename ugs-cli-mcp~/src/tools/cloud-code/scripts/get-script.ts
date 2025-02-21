import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerGetScript(server: McpServer) {
    server.tool(
        "get-script",
        "Get information about a Cloud-Code script",
        {
            "name": z.string().describe("Name of the script to get information about"),
            "moduleName": z.string().describe("Name of the module containing the script")
        },
        async ({ name, moduleName }) => {
            try {
                const command = `ugs cloud-code scripts get ${name} --module ${moduleName}`;
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
