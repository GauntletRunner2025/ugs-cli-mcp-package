import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerDeleteBadge(server: McpServer) {
    server.tool(
        "delete-badge",
        "Delete a badge",
        {
            "name": z.string().describe("Name of the badge"),
            "bucketId": z.string().describe("ID of the bucket")
        },
        async ({ name, bucketId }) => {
            try {
                const command = `ugs ccd badges delete ${name} ${bucketId}`;
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
