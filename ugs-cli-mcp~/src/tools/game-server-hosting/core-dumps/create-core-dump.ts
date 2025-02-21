import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerCreateCoreDump(server: McpServer) {
    server.tool(
        "create-core-dump",
        "Create a new core dump",
        {
            "serverId": z.string().describe("ID of the server"),
            "filePath": z.string().describe("Path to the core dump file"),
            "notes": z.string().optional().describe("Notes about the core dump")
        },
        async ({ serverId, filePath, notes }) => {
            try {
                let command = `ugs gsh core-dump create ${serverId} ${filePath}`;
                
                if (notes) {
                    command += ` --notes "${notes}"`;
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
