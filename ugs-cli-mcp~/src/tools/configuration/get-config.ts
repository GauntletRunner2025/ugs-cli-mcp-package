import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerGetConfig(server: McpServer) {
    server.tool(
        "get-config",
        "Get the value of a configuration for the given key.",
        {
            "key": z.string().describe("The configuration key to get the value for"),
            "help": z.boolean().optional().describe("Display help and usage information"),
            "quiet": z.boolean().optional().describe("Reduce logging to a minimum"),
            "json": z.boolean().optional().describe("Use JSON as the output format")
        },
        async ({ key, help, quiet, json }) => {
            try {
                let command = `ugs config get ${key}`;

                if (help) command += ` -h`;
                if (quiet) command += ` -q`;
                if (json) command += ` -j`;

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
