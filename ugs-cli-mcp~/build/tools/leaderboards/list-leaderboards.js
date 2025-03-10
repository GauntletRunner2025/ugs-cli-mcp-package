import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerListLeaderboards(server) {
    server.tool("list-leaderboards", "List all leaderboards", {
        "cursor": z.string().optional().describe("Cursor for pagination"),
        "limit": z.number().optional().describe("Number of items to return"),
        "projectId": z.string().optional().describe("Project ID"),
        "environmentName": z.string().optional().describe("Environment name"),
        "quiet": z.boolean().optional().describe("Suppress output"),
        "json": z.boolean().optional().describe("Output in JSON format")
    }, async ({ cursor, limit, projectId, environmentName, quiet, json }) => {
        try {
            let command = `ugs leaderboards list`;
            if (cursor) {
                command += ` --cursor ${cursor}`;
            }
            if (limit !== undefined) {
                command += ` --limit ${limit}`;
            }
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
