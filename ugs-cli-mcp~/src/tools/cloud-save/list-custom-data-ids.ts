import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { validateProjectId } from "../../utils/project-validation.js";

const execAsync = promisify(exec);

// Store the last error response
let lastError: any = null;

export function registerListCustomDataIDs(server: McpServer) {

server.tool(
    "get-error-details",
    "Get the detailed error response from the last failed command",
    async () => {
        return {
            content: [{ type: "text", text: lastError ? JSON.stringify(lastError, null, 2) : "No error stored" }]
        };
    }
);

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
            const validation = await validateProjectId();
            if (!validation.isValid) {
                lastError = validation.error;
                console.error("[Error]:", validation.error);
                return {
                    content: [{ type: "text", text: `[Error]: ${validation.error}` }]
                };
            }

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
