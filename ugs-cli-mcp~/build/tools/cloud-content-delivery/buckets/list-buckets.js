import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerListBuckets(server) {
    server.tool("list-buckets", "List all buckets", {
        "labels": z.array(z.string()).optional().describe("Filter buckets by labels")
    }, async ({ labels }) => {
        try {
            let command = `ugs ccd buckets list`;
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
