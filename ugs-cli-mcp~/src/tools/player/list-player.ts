import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const execAsync = promisify(exec);

export function registerListPlayer(server: McpServer) {
    server.tool(
        "list-player",
        "Return a list of the project's players and their information",
        async () => {
            try {
                const { stdout, stderr } = await execAsync('ugs player list');
                
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
