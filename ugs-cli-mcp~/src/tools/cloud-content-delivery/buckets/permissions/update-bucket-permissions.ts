import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerUpdateBucketPermissions(server: McpServer) {
    server.tool(
        "update-bucket-permissions",
        "Update bucket permissions",
        {
            "bucketId": z.string().describe("ID of the bucket"),
            "filePath": z.string().describe("Path to the permissions file")
        },
        async ({ bucketId, filePath }) => {
            try {
                const command = `ugs ccd buckets permissions update ${bucketId} ${filePath}`;
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
