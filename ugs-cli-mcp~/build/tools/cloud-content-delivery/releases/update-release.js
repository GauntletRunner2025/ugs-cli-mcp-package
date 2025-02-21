import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerUpdateRelease(server) {
    server.tool("update-release", "Update a release", {
        "bucketId": z.string().describe("ID of the bucket"),
        "releaseId": z.string().describe("ID of the release to update"),
        "name": z.string().optional().describe("New name for the release"),
        "notes": z.string().optional().describe("New release notes"),
        "labels": z.array(z.string()).optional().describe("New labels for the release"),
        "addLabels": z.array(z.string()).optional().describe("Labels to add to the release"),
        "removeLabels": z.array(z.string()).optional().describe("Labels to remove from the release")
    }, async ({ bucketId, releaseId, name, notes, labels, addLabels, removeLabels }) => {
        try {
            let command = `ugs ccd releases update ${bucketId} ${releaseId}`;
            if (name) {
                command += ` --name "${name}"`;
            }
            if (notes) {
                command += ` --notes "${notes}"`;
            }
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
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Error: ${error?.message || String(error)}` }]
            };
        }
    });
}
