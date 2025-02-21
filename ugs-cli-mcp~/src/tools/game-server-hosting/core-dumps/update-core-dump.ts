import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerUpdateCoreDump(server: McpServer) {
    server.tool(
        "update-core-dump",
        "Update a core dump",
        {
            "coreDumpId": z.string().describe("ID of the core dump to update"),
            "notes": z.string().describe("New notes for the core dump")
        },
        async ({ coreDumpId, notes }) => {
            try {
                const command = `ugs gsh core-dump update ${coreDumpId} --notes "${notes}"`;
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
