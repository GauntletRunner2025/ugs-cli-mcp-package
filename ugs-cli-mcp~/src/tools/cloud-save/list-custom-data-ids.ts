import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

// Store the last error response
let lastError: any = null;

export function registerListCustomDataIDs(server: McpServer) {

server.tool(
    "list-custom-data-ids",
    "Get a paginated list of all Game State custom data IDs for a given project and environment.",
    {
        "limit": z.string(),
    },
    async ({ 
        "limit":limit,
     }) => {
        // Clear previous error
        lastError = null;
        
        try {
            const ugsCommand = ['ugs', 'cloud-save', 'data', 'custom', 'list'];

            if (limit) {
                ugsCommand.push('--limit', limit);
            }

            const { stdout, stderr } = await execAsync(ugsCommand.join(' '));
            if (stderr) {
                console.error("[stderr]:", stderr);
            }
            return {
                content: [{ type: "text", text: stdout.trim() }]
            };
        } catch (error: any) {
            lastError = error;
            console.error("[Error]:", error?.message || String(error));
            if (error?.stderr) {
                console.error("[stderr]:", error.stderr);
            }
            return {
                content: [{ type: "text", text: `[Error]: ${error?.message || String(error)}` }]
            };
        }
    }
  );
}
