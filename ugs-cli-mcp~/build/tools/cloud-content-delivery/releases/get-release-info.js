import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerGetReleaseInfo(server) {
    server.tool("get-release-info", "Get information about a release", {
        "bucketId": z.string().describe("ID of the bucket"),
        "releaseId": z.string().describe("ID of the release")
    }, async ({ bucketId, releaseId }) => {
        try {
            const command = `ugs ccd releases info ${bucketId} ${releaseId}`;
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
