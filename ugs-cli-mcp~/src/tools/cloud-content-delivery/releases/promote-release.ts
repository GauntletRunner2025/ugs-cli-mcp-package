import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerPromoteRelease(server: McpServer) {
    server.tool(
        "promote-release",
        "Promote a release to another environment",
        {
            "bucketId": z.string().describe("ID of the bucket"),
            "releaseId": z.string().describe("ID of the release to promote"),
            "targetEnvironment": z.string().describe("Target environment to promote to"),
            "notes": z.string().optional().describe("Notes for the promotion"),
            "async": z.boolean().optional().describe("Run the promotion asynchronously")
        },
        async ({ bucketId, releaseId, targetEnvironment, notes, async }) => {
            try {
                let command = `ugs ccd releases promote ${bucketId} ${releaseId} ${targetEnvironment}`;
                
                if (notes) {
                    command += ` --notes "${notes}"`;
                }
                
                if (async) {
                    command += ` --async`;
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
