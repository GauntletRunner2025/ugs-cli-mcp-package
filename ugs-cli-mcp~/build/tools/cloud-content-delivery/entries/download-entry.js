import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerDownloadEntry(server) {
    server.tool("download-entry", "Download an entry", {
        "bucketId": z.string().describe("ID of the bucket"),
        "entryId": z.string().describe("ID of the entry to download"),
        "outputPath": z.string().describe("Path where the entry will be downloaded"),
        "decompress": z.boolean().optional().describe("Decompress the downloaded file"),
        "retries": z.number().optional().describe("Number of times to retry failed downloads")
    }, async ({ bucketId, entryId, outputPath, decompress, retries }) => {
        try {
            let command = `ugs ccd entries download ${bucketId} ${entryId} ${outputPath}`;
            if (decompress) {
                command += ` --decompress`;
            }
            if (retries !== undefined) {
                command += ` --retries ${retries}`;
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
