import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerDeleteBuild(server: McpServer) {
    server.tool(
        "delete-build",
        "Delete a build",
        {
            "buildId": z.string().describe("ID of the build to delete")
        },
        async ({ buildId }) => {
            try {
                const command = `ugs gsh build delete ${buildId}`;
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
