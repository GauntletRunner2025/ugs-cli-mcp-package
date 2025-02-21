import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerUpdateEntry(server: McpServer) {
    server.tool(
        "update-entry",
        "Update an entry",
        {
            "bucketId": z.string().describe("ID of the bucket"),
            "entryId": z.string().describe("ID of the entry to update"),
            "labels": z.array(z.string()).optional().describe("New labels for the entry"),
            "addLabels": z.array(z.string()).optional().describe("Labels to add to the entry"),
            "removeLabels": z.array(z.string()).optional().describe("Labels to remove from the entry")
        },
        async ({ bucketId, entryId, labels, addLabels, removeLabels }) => {
            try {
                let command = `ugs ccd entries update ${bucketId} ${entryId}`;
                
                if (labels && labels.length > 0) {
                    command += ` --labels ${labels.join(',')}`;
                }
                
                if (addLabels && addLabels.length > 0) {
                    command += ` --add-labels ${addLabels.join(',')}`;
                }
                
                if (removeLabels && removeLabels.length > 0) {
                    command += ` --remove-labels ${removeLabels.join(',')}`;
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
