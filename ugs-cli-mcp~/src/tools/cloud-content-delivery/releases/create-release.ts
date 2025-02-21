import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerCreateRelease(server: McpServer) {
    server.tool(
        "create-release",
        "Create a new release",
        {
            "bucketId": z.string().describe("ID of the bucket"),
            "name": z.string().describe("Name of the release"),
            "notes": z.string().optional().describe("Release notes"),
            "labels": z.array(z.string()).optional().describe("Labels to apply to the release")
        },
        async ({ bucketId, name, notes, labels }) => {
            try {
                let command = `ugs ccd releases create ${bucketId} ${name}`;
                
                if (notes) {
                    command += ` --notes "${notes}"`;
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
