import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerLogin(server: McpServer) {
    server.tool(
        "login",
        "Log in to Unity Gaming Services",
        {
            "token": z.string().optional().describe("API token to use for authentication")
        },
        async ({ token }) => {
            try {
                let command = `ugs login`;
                if (token) {
                    command += ` --token ${token}`;
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
