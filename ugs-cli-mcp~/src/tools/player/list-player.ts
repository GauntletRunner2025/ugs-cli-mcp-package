import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerListPlayer(server: McpServer) {
    server.tool(
        "list-player",
        {
            limit: z.number().optional(),
            next: z.string().optional()
        },
        async (params, _extra) => {
            try {
                let cmd = 'ugs player list';
                
                // Add optional parameters if provided
                if (params?.limit) {
                    cmd += ` -l ${params.limit}`;
                }
                if (params?.next) {
                    cmd += ` -n ${params.next}`;
                }
                
                const { stdout, stderr } = await execAsync(cmd);
                
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
