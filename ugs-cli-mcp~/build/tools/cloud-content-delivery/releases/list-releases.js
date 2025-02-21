import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerListReleases(server) {
    server.tool("list-releases", "List all releases in a bucket", {
        "bucketId": z.string().describe("ID of the bucket"),
        "labels": z.array(z.string()).optional().describe("Filter releases by labels")
    }, async ({ bucketId, labels }) => {
        try {
            let command = `ugs ccd releases list ${bucketId}`;
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
