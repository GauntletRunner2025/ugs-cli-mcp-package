import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerDeleteBucket(server: McpServer) {
    server.tool(
        "delete-bucket",
        "Delete a bucket",
        {
            "bucketId": z.string().describe("ID of the bucket to delete")
        },
        async ({ bucketId }) => {
            try {
                const command = `ugs ccd buckets delete ${bucketId}`;
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
