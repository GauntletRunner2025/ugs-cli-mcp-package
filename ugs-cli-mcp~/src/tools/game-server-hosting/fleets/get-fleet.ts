import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerGetFleet(server: McpServer) {
    server.tool(
        "get-fleet",
        "Get information about a fleet",
        {
            "fleetId": z.string().describe("ID of the fleet")
        },
        async ({ fleetId }) => {
            try {
                const command = `ugs gsh fleet get ${fleetId}`;
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
