import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const execAsync = promisify(exec);

export function registerCreatePlayer(server: McpServer) {
    server.tool(
        "create-player",
        "Create an anonymous player account",
        async () => {
            try {
                const { stdout, stderr } = await execAsync('ugs player create');
                
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
