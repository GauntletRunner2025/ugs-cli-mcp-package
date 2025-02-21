import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerGetEntryInfo(server) {
    server.tool("get-entry-info", "Get information about an entry", {
        "bucketId": z.string().describe("ID of the bucket"),
        "entryId": z.string().describe("ID of the entry")
    }, async ({ bucketId, entryId }) => {
        try {
            const command = `ugs ccd entries info ${bucketId} ${entryId}`;
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
