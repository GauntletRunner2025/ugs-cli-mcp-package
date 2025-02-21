import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerGetConfig(server: McpServer) {
    server.tool(
        "get-config",
        "Get the value of a configuration key",
        {
            "key": z.string().describe("The configuration key to get the value for")
        },
        async ({ key }) => {
            try {
                const command = `ugs config get ${key}`;
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
