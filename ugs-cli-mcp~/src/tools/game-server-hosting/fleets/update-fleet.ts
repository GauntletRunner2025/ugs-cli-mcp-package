import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerUpdateFleet(server: McpServer) {
    server.tool(
        "update-fleet",
        "Update a fleet",
        {
            "fleetId": z.string().describe("ID of the fleet to update"),
            "name": z.string().optional().describe("New name for the fleet"),
            "description": z.string().optional().describe("New description for the fleet"),
            "allowedRegions": z.array(z.string()).optional().describe("New list of allowed regions")
        },
        async ({ fleetId, name, description, allowedRegions }) => {
            try {
                let command = `ugs gsh fleet update ${fleetId}`;
                
                if (name) {
                    command += ` --name ${name}`;
                }
                
                if (description) {
                    command += ` --description "${description}"`;
                }
                
                if (allowedRegions && allowedRegions.length > 0) {
                    command += ` --allowed-regions ${allowedRegions.join(',')}`;
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
