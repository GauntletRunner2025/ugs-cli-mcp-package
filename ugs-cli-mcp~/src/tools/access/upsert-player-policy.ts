import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerUpsertPlayerPolicy(server: McpServer) {
    server.tool(
        "upsert-player-policy",
        "Create or update a player policy",
        {
            "playerId": z.string().describe("The ID of the player whose policy to create or update"),
            "filePath": z.string().describe("Path to the policy file"),
            "policyId": z.string().optional().describe("ID for the policy")
        },
        async ({ playerId, filePath, policyId }) => {
            try {
                let command = `ugs access upsert-player-policy ${playerId} ${filePath}`;
                if (policyId) {
                    command += ` --policy-id ${policyId}`;
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
