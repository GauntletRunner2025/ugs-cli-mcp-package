import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerDeletePlayerPolicyStatements(server: McpServer) {
    server.tool(
        "delete-player-policy-statements",
        "Delete player policy statements",
        {
            "playerId": z.string().describe("The ID of the player whose policy statements to delete"),
            "filePath": z.string().describe("The path of the JSON file containing delete options schema"),

            //Optional
            "projectId": z.string().optional().describe("The Unity cloud project ID."),
            "environment": z.string().optional().describe("The services environment name."),
            "help": z.boolean().optional().describe("Display help and usage information."),
            "quiet": z.boolean().optional().describe("Reduce logging to a minimum."),
            "json": z.boolean().optional().describe("Use JSON as the output format.")
        },

        async ({ playerId, filePath, projectId, environment, help, quiet, json }) => {
            let result = { 
                content: [{ 
                    type: "text" as const,
                    text: "" 
                }]
            };
            try {
                const commandParts = ['ugs', 'access', 'delete-player-policy-statements', playerId, filePath];
                
                if (projectId) {
                    commandParts.push('--project-id', projectId);
                }
                if (environment) {
                    commandParts.push('--environment-name', environment);
                }
                if (help) {
                    commandParts.push('--help');
                }
                if (quiet) {
                    commandParts.push('--quiet');
                }
                if (json) {
                    commandParts.push('--json');
                }

                const command = commandParts.join(' ');
                const { stdout, stderr } = await execAsync(command);
                result.content[0].text = stdout.trim() || `Error: ${stderr}`;
            } catch (error: any) {
                result.content[0].text = `Error: ${error?.message || String(error)}`;
            } finally {
                return result;
            }
        }
    );
}
