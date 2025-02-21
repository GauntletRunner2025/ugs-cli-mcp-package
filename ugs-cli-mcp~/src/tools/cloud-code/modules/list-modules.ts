import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerListModules(server: McpServer) {
    server.tool(
        "list-modules",
        "List all Cloud-Code modules",
        {
            "filter": z.string().optional().describe("Filter modules by name"),
            "limit": z.number().optional().describe("Maximum number of modules to return"),
            "skip": z.number().optional().describe("Number of modules to skip")
        },
        async ({ filter, limit, skip }) => {
            try {
                let command = `ugs cloud-code modules list`;
                if (filter) {
                    command += ` --filter ${filter}`;
                }
                if (limit !== undefined) {
                    command += ` --limit ${limit}`;
                }
                if (skip !== undefined) {
                    command += ` --skip ${skip}`;
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
