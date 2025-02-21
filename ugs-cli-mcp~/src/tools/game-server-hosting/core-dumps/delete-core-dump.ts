import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerDeleteCoreDump(server: McpServer) {
    server.tool(
        "delete-core-dump",
        "Delete a core dump",
        {
            "coreDumpId": z.string().describe("ID of the core dump to delete")
        },
        async ({ coreDumpId }) => {
            try {
                const command = `ugs gsh core-dump delete ${coreDumpId}`;
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
