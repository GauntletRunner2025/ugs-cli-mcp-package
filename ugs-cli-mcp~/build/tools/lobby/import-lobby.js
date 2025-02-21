import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerImportLobby(server) {
    server.tool("import-lobby", "Import lobby configuration into an environment", {
        "inDir": z.string().optional().describe("Input directory"),
        "fileName": z.string().optional().describe("Configuration file name"),
        "projectId": z.string().optional().describe("Project ID"),
        "environmentName": z.string().optional().describe("Environment name"),
        "dryRun": z.boolean().optional().describe("Validate without importing"),
        "reconcile": z.boolean().optional().describe("Reconcile configurations"),
        "quiet": z.boolean().optional().describe("Suppress output"),
        "json": z.boolean().optional().describe("Output in JSON format")
    }, async ({ inDir, fileName, projectId, environmentName, dryRun, reconcile, quiet, json }) => {
        try {
            let command = `ugs lobby import`;
            if (inDir) {
                command += ` ${inDir}`;
                if (fileName) {
                    command += ` ${fileName}`;
                }
            }
            if (projectId) {
                command += ` -p ${projectId}`;
            }
            if (environmentName) {
                command += ` -e ${environmentName}`;
            }
            if (dryRun) {
                command += ` --dry-run`;
            }
            if (reconcile) {
                command += ` --reconcile`;
            }
            if (quiet) {
                command += ` -q`;
            }
            if (json) {
                command += ` -j`;
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
