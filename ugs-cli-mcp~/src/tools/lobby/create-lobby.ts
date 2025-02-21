import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerCreateLobby(server: McpServer) {
    server.tool(
        "create-lobby",
        "Create a new lobby",
        {
            "body": z.string().describe("JSON string or file path with lobby details"),
            "serviceId": z.string().describe("Service ID"),
            "playerId": z.string().optional().describe("Player ID"),
            "projectId": z.string().optional().describe("Project ID"),
            "environmentName": z.string().optional().describe("Environment name"),
            "quiet": z.boolean().optional().describe("Suppress output"),
            "json": z.boolean().optional().describe("Output in JSON format")
        },
        async ({ body, serviceId, playerId, projectId, environmentName, quiet, json }) => {
            try {
                let command = `ugs lobby create ${body}`;
                
                command += ` --service-id ${serviceId}`;
                
                if (playerId) {
                    command += ` --player-id ${playerId}`;
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
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Error: ${error?.message || String(error)}` }]
                };
            }
        }
    );
}
