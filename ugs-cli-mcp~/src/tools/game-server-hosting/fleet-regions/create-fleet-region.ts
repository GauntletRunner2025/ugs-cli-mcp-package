import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerCreateFleetRegion(server: McpServer) {
    server.tool(
        "create-fleet-region",
        "Create a new fleet region",
        {
            "fleetId": z.string().describe("ID of the fleet"),
            "regionId": z.string().describe("ID of the region"),
            "minServers": z.number().describe("Minimum number of servers"),
            "maxServers": z.number().describe("Maximum number of servers"),
            "standbyServers": z.number().describe("Number of standby servers"),
            "templateId": z.string().optional().describe("ID of the template to use"),
            "enableAutoScaling": z.boolean().optional().describe("Enable auto scaling"),
            "scaleInThreshold": z.number().optional().describe("Scale in threshold"),
            "scaleOutThreshold": z.number().optional().describe("Scale out threshold"),
            "scalingInterval": z.number().optional().describe("Scaling interval in seconds")
        },
        async ({ fleetId, regionId, minServers, maxServers, standbyServers, templateId, enableAutoScaling, scaleInThreshold, scaleOutThreshold, scalingInterval }) => {
            try {
                let command = `ugs gsh fleet-region create ${fleetId} ${regionId} ${minServers} ${maxServers} ${standbyServers}`;
                
                if (templateId) {
                    command += ` --template-id ${templateId}`;
                }
                
                if (enableAutoScaling !== undefined) {
                    command += ` --enable-auto-scaling ${enableAutoScaling}`;
                }
                
                if (scaleInThreshold !== undefined) {
                    command += ` --scale-in-threshold ${scaleInThreshold}`;
                }
                
                if (scaleOutThreshold !== undefined) {
                    command += ` --scale-out-threshold ${scaleOutThreshold}`;
                }
                
                if (scalingInterval !== undefined) {
                    command += ` --scaling-interval ${scalingInterval}`;
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
