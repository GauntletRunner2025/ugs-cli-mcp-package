import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerCreateBuildVersion(server) {
    server.tool("create-build-version", "Create a new version of an existing build", {
        "buildId": z.string().describe("ID of the build"),
        "filePath": z.string().describe("Path to the build file"),
        "version": z.string().optional().describe("Version number for the build"),
        "notes": z.string().optional().describe("Notes for this version")
    }, async ({ buildId, filePath, version, notes }) => {
        try {
            let command = `ugs gsh build create-version ${buildId} ${filePath}`;
            if (version) {
                command += ` --version ${version}`;
            }
            if (notes) {
                command += ` --notes "${notes}"`;
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
