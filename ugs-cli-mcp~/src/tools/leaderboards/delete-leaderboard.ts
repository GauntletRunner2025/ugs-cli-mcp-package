import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerDeleteLeaderboard(server: McpServer) {
    server.tool(
        "delete-leaderboard",
        "Delete a leaderboard",
        {
            "leaderboardId": z.string().describe("ID of the leaderboard to delete"),
            "projectId": z.string().optional().describe("Project ID"),
            "environmentName": z.string().optional().describe("Environment name"),
            "quiet": z.boolean().optional().describe("Suppress output"),
            "json": z.boolean().optional().describe("Output in JSON format")
        },
        async ({ leaderboardId, projectId, environmentName, quiet, json }) => {
            try {
                let command = `ugs leaderboards delete ${leaderboardId}`;
                
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
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Error: ${error?.message || String(error)}` }]
                };
            }
        }
    );
}
