import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerGetResources(server: McpServer) {
    server.tool(
        "get-resources",
        "Get Economy resources configuration",
        {
            "output": z.string().optional().describe("Path to save the configuration file")
        },
        async ({ output }) => {
            try {
                let command = `ugs economy get-resources`;
                
                if (output) {
                    command += ` --output ${output}`;
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
