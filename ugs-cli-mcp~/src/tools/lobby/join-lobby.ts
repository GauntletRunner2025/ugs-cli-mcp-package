import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerJoinLobby(server: McpServer) {
    server.tool(
        "join-lobby",
        "Join a lobby by ID or code",
        {
            "playerDetails": z.string().describe("JSON string or file path with player details"),
            "serviceId": z.string().describe("Service ID"),
            "lobbyId": z.string().optional().describe("Lobby ID"),
            "lobbyCode": z.string().optional().describe("Lobby code"),
            "projectId": z.string().optional().describe("Project ID"),
            "environmentName": z.string().optional().describe("Environment name"),
            "quiet": z.boolean().optional().describe("Suppress output"),
            "json": z.boolean().optional().describe("Output in JSON format")
        },
        async ({ playerDetails, serviceId, lobbyId, lobbyCode, projectId, environmentName, quiet, json }) => {
            try {
                let command = `ugs lobby join ${playerDetails}`;
                
                command += ` --service-id ${serviceId}`;
                
                if (lobbyId) {
                    command += ` --lobby-id ${lobbyId}`;
                } else if (lobbyCode) {
                    command += ` --lobby-code ${lobbyCode}`;
                } else {
                    throw new Error("Either lobby-id or lobby-code must be provided");
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
