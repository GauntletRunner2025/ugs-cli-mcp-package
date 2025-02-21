import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerUpdateBuildConfiguration(server: McpServer) {
    server.tool(
        "update-build-configuration",
        "Update a build configuration",
        {
            "buildConfigurationId": z.string().describe("ID of the build configuration to update"),
            "name": z.string().optional().describe("New name for the build configuration"),
            "buildName": z.string().optional().describe("New build name"),
            "fleetId": z.string().optional().describe("New fleet ID"),
            "queryType": z.string().optional().describe("New query type"),
            "containerImage": z.string().optional().describe("New container image"),
            "cores": z.number().optional().describe("New number of CPU cores"),
            "memory": z.number().optional().describe("New memory in GB"),
            "maxServers": z.number().optional().describe("New maximum number of servers")
        },
        async ({ buildConfigurationId, name, buildName, fleetId, queryType, containerImage, cores, memory, maxServers }) => {
            try {
                let command = `ugs gsh build-configuration update ${buildConfigurationId}`;
                
                if (name) {
                    command += ` --name ${name}`;
                }
                if (buildName) {
                    command += ` --build-name ${buildName}`;
                }
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
