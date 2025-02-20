import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerGetPlayer(server: McpServer) {
    server.tool(
        "get-player",
        "Shows an existing player account information",
        {
            "playerId": z.string().describe("The ID of the player to retrieve")
        },
        async ({ playerId }) => {
            try {
                const { stdout, stderr } = await execAsync(`ugs player get ${playerId}`);
                
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
