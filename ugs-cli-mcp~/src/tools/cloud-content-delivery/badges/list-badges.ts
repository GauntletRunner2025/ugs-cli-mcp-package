import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerListBadges(server: McpServer) {
    server.tool(
        "list-badges",
        "List all badges in a bucket",
        {
            "bucketId": z.string().describe("ID of the bucket")
        },
        async ({ bucketId }) => {
            try {
                const command = `ugs ccd badges list ${bucketId}`;
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
