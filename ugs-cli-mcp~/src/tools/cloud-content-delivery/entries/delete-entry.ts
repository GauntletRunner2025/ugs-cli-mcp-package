import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerDeleteEntry(server: McpServer) {
    server.tool(
        "delete-entry",
        "Delete an entry",
        {
            "bucketId": z.string().describe("ID of the bucket"),
            "entryId": z.string().describe("ID of the entry to delete")
        },
        async ({ bucketId, entryId }) => {
            try {
                const command = `ugs ccd entries delete ${bucketId} ${entryId}`;
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
