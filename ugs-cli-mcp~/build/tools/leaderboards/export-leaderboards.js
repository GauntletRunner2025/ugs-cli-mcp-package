import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerExportLeaderboards(server) {
    server.tool("export-leaderboards", "Export leaderboard configurations", {
        "outDir": z.string().describe("Output directory for configurations"),
        "fileName": z.string().describe("Name of the configuration file"),
        "projectId": z.string().optional().describe("Project ID"),
        "environmentName": z.string().optional().describe("Environment name"),
        "quiet": z.boolean().optional().describe("Suppress output"),
        "json": z.boolean().optional().describe("Output in JSON format")
    }, async ({ outDir, fileName, projectId, environmentName, quiet, json }) => {
        try {
            let command = `ugs leaderboards export ${outDir} ${fileName}`;
            if (projectId) {
                command += ` -p ${projectId}`;
            }
            if (environmentName) {
                command += ` -e ${environmentName}`;
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
