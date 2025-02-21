import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerPublish(server: McpServer) {
    server.tool(
        "publish-economy",
        "Publish Economy configuration",
        {
            "filePath": z.string().describe("Path to the configuration file to publish"),
            "dryRun": z.boolean().optional().describe("Validate the configuration without publishing")
        },
        async ({ filePath, dryRun }) => {
            try {
                let command = `ugs economy publish ${filePath}`;
                
                if (dryRun) {
                    command += ` --dry-run`;
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
