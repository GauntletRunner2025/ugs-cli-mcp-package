import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerSyncEntries(server: McpServer) {
    server.tool(
        "sync-entries",
        "Sync entries between local directory and bucket",
        {
            "bucketId": z.string().describe("ID of the bucket"),
            "localPath": z.string().describe("Local directory path"),
            "remotePath": z.string().optional().describe("Remote path in the bucket"),
            "labels": z.array(z.string()).optional().describe("Labels to apply to new entries"),
            "dryRun": z.boolean().optional().describe("Show what would be uploaded without actually uploading"),
            "delete": z.boolean().optional().describe("Delete entries in bucket that don't exist locally"),
            "noRecursive": z.boolean().optional().describe("Don't recursively sync directories"),
            "retries": z.number().optional().describe("Number of times to retry failed uploads")
        },
        async ({ bucketId, localPath, remotePath, labels, dryRun, delete: deleteFlag, noRecursive, retries }) => {
            try {
                let command = `ugs ccd entries sync ${bucketId} ${localPath}`;
                
                if (remotePath) {
                    command += ` ${remotePath}`;
                }
                
                if (labels && labels.length > 0) {
                    command += ` --labels ${labels.join(',')}`;
                }
                
                if (dryRun) {
                    command += ` --dry-run`;
                }
                
                if (deleteFlag) {
                    command += ` --delete`;
                }
                
                if (noRecursive) {
                    command += ` --no-recursive`;
                }
                
                if (retries !== undefined) {
                    command += ` --retries ${retries}`;
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
