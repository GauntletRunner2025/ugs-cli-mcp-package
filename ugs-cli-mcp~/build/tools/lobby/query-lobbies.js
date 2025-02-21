import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerQueryLobbies(server) {
    server.tool("query-lobbies", "Query for active lobbies", {
        "serviceId": z.string().describe("Service ID"),
        "playerId": z.string().optional().describe("Player ID"),
        "body": z.string().optional().describe("JSON query string"),
        "projectId": z.string().optional().describe("Project ID"),
        "environmentName": z.string().optional().describe("Environment name"),
        "quiet": z.boolean().optional().describe("Suppress output"),
        "json": z.boolean().optional().describe("Output in JSON format")
    }, async ({ serviceId, playerId, body, projectId, environmentName, quiet, json }) => {
        try {
            let command = `ugs lobby query`;
            command += ` --service-id ${serviceId}`;
            if (playerId) {
                command += ` --player-id ${playerId}`;
            }
            if (body) {
                command += ` -b ${body}`;
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
