import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerCreateBuildConfiguration(server: McpServer) {
    server.tool(
        "create-build-configuration",
        "Create a new build configuration",
        {
            "name": z.string().describe("Name of the build configuration"),
            "buildName": z.string().describe("Name of the build"),
            "fleetId": z.string().optional().describe("ID of the fleet"),
            "queryType": z.string().optional().describe("Query type for the build"),
            "containerImage": z.string().optional().describe("Container image for the build"),
            "cores": z.number().optional().describe("Number of CPU cores"),
            "memory": z.number().optional().describe("Memory in GB"),
            "maxServers": z.number().optional().describe("Maximum number of servers")
        },
        async ({ name, buildName, fleetId, queryType, containerImage, cores, memory, maxServers }) => {
            try {
                let command = `ugs gsh build-configuration create ${name} ${buildName}`;
                
                if (fleetId) {
                    command += ` --fleet-id ${fleetId}`;
                }
                if (queryType) {
                    command += ` --query-type ${queryType}`;
                }
                if (containerImage) {
                    command += ` --container-image ${containerImage}`;
                }
                if (cores !== undefined) {
                    command += ` --cores ${cores}`;
                }
                if (memory !== undefined) {
                    command += ` --memory ${memory}`;
                }
                if (maxServers !== undefined) {
                    command += ` --max-servers ${maxServers}`;
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
