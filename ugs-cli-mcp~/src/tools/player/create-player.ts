import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const execAsync = promisify(exec);

// Helper function to create a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function registerCreatePlayer(server: McpServer) {
    server.tool(
        "create-player",
        "Create an anonymous player account",
        async () => {
            try {
                console.log("Creating Player...");
                const { stdout, stderr } = await execAsync('ugs player create');
                
                // Add a delay of 1 second before processing the output
                await sleep(1000);
                
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
