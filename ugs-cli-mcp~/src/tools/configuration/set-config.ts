import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerSetConfig(server: McpServer) {
    server.tool(
        "set-config",
        "Set the value of a configuration key",
        {
            "key": z.string().describe("The configuration key to set"),
            "value": z.string().describe("The value to set for the configuration key")
        },
        async ({ key, value }) => {
            try {
                const command = `ugs config set ${key} ${value}`;
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
