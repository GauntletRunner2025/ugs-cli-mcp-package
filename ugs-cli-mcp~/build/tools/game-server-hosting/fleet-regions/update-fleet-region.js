import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerUpdateFleetRegion(server) {
    server.tool("update-fleet-region", "Update a fleet region", {
        "fleetId": z.string().describe("ID of the fleet"),
        "regionId": z.string().describe("ID of the region"),
        "minServers": z.number().optional().describe("New minimum number of servers"),
        "maxServers": z.number().optional().describe("New maximum number of servers"),
        "standbyServers": z.number().optional().describe("New number of standby servers"),
        "templateId": z.string().optional().describe("New template ID"),
        "enableAutoScaling": z.boolean().optional().describe("Enable/disable auto scaling"),
        "scaleInThreshold": z.number().optional().describe("New scale in threshold"),
        "scaleOutThreshold": z.number().optional().describe("New scale out threshold"),
        "scalingInterval": z.number().optional().describe("New scaling interval in seconds")
    }, async ({ fleetId, regionId, minServers, maxServers, standbyServers, templateId, enableAutoScaling, scaleInThreshold, scaleOutThreshold, scalingInterval }) => {
        try {
            let command = `ugs gsh fleet-region update ${fleetId} ${regionId}`;
            if (minServers !== undefined) {
                command += ` --min-servers ${minServers}`;
            }
            if (maxServers !== undefined) {
                command += ` --max-servers ${maxServers}`;
            }
            if (standbyServers !== undefined) {
                command += ` --standby-servers ${standbyServers}`;
            }
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
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Error: ${error?.message || String(error)}` }]
            };
        }
    });
}
