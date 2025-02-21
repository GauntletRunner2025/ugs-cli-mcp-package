import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerAddEnvironment(server: McpServer) {
    server.tool(
        "add-environment",
        "Add a new environment",
        {
            "name": z.string().describe("Name of the environment to add"),
            "projectId": z.string().describe("Project ID for the environment")
        },
        async ({ name, projectId }) => {
            try {
                const command = `ugs environment add ${name} ${projectId}`;
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
