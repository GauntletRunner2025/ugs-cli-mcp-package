import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerListMachines(server: McpServer) {
    server.tool(
        "list-machines",
        "List all machines",
        {
            "fleetId": z.string().optional().describe("Filter machines by fleet ID"),
            "regionId": z.string().optional().describe("Filter machines by region ID"),
            "status": z.string().optional().describe("Filter machines by status")
        },
        async ({ fleetId, regionId, status }) => {
            try {
                let command = `ugs gsh machine list`;
                
                if (fleetId) {
                    command += ` --fleet-id ${fleetId}`;
                }
                
                if (regionId) {
                    command += ` --region-id ${regionId}`;
                }
                
                if (status) {
                    command += ` --status ${status}`;
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
