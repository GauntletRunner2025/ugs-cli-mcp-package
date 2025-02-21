import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerGetBucketInfo(server) {
    server.tool("get-bucket-info", "Get information about a bucket", {
        "bucketId": z.string().describe("ID of the bucket to get information about")
    }, async ({ bucketId }) => {
        try {
            const command = `ugs ccd buckets info ${bucketId}`;
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
