import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerGetPromotionStatus(server: McpServer) {
    server.tool(
        "get-promotion-status",
        "Get the status of a release promotion",
        {
            "bucketId": z.string().describe("ID of the bucket"),
            "promotionId": z.string().describe("ID of the promotion")
        },
        async ({ bucketId, promotionId }) => {
            try {
                const command = `ugs ccd releases promotions status ${bucketId} ${promotionId}`;
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
