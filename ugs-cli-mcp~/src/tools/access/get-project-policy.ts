import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerGetProjectPolicy(server: McpServer) {
    server.tool(
        "get-project-policy",
        "Get a project policy",
        {
            "projectId": z.string().describe("The ID of the project whose policy to get"),
            "policyId": z.string().describe("The ID of the policy to get")
        },
        async ({ projectId, policyId }) => {
            try {
                const command = `ugs access get-project-policy ${projectId} ${policyId}`;
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
