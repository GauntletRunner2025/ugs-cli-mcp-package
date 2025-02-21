import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerCopyEntry(server) {
    server.tool("copy-entry", "Copy an entry from one bucket to another", {
        "sourceBucketId": z.string().describe("ID of the source bucket"),
        "sourceEntryId": z.string().describe("ID of the entry to copy"),
        "targetBucketId": z.string().describe("ID of the target bucket"),
        "targetPath": z.string().describe("Path where the entry will be copied to"),
        "labels": z.array(z.string()).optional().describe("Labels to apply to the copied entry")
    }, async ({ sourceBucketId, sourceEntryId, targetBucketId, targetPath, labels }) => {
        try {
            let command = `ugs ccd entries copy ${sourceBucketId} ${sourceEntryId} ${targetBucketId} ${targetPath}`;
            if (labels && labels.length > 0) {
                command += ` --labels ${labels.join(',')}`;
            }
            const { stdout, stderr } = await execAsync(command);
            return {
                content: [{ type: "text", text: stdout.trim() || `Error: ${stderr}` }]
            };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Error: ${error?.message || String(error)}` }]
            };
        }
    });
}
