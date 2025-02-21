import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerListEntries(server: McpServer) {
    server.tool(
        "list-entries",
        "List entries in a bucket",
        {
            "bucketId": z.string().describe("ID of the bucket"),
            "path": z.string().optional().describe("Path to list entries from"),
            "recursive": z.boolean().optional().describe("List entries recursively"),
            "labels": z.array(z.string()).optional().describe("Filter entries by labels")
        },
        async ({ bucketId, path, recursive, labels }) => {
            try {
                let command = `ugs ccd entries list ${bucketId}`;
                
                if (path) {
                    command += ` ${path}`;
                }
                
                if (recursive) {
                    command += ` --recursive`;
                }
                
                if (labels && labels.length > 0) {
                    command += ` --labels ${labels.join(',')}`;
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
