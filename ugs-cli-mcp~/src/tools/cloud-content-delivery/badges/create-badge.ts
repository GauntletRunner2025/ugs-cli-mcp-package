import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerCreateBadge(server: McpServer) {
    server.tool(
        "create-badge",
        "Create a new badge",
        {
            "name": z.string().describe("Name of the badge"),
            "bucketId": z.string().describe("ID of the bucket"),
            "releaseId": z.string().describe("ID of the release")
        },
        async ({ name, bucketId, releaseId }) => {
            try {
                const command = `ugs ccd badges create ${name} ${bucketId} ${releaseId}`;
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
