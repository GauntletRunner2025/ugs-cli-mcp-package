import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerNewTriggerFile(server: McpServer) {
    server.tool(
        "new-trigger-file",
        "Create a new Triggers configuration file",
        {
            "outDir": z.string().describe("Output directory for the configuration file"),
            "fileName": z.string().describe("Name of the configuration file"),
            "quiet": z.boolean().optional().describe("Suppress output"),
            "json": z.boolean().optional().describe("Output in JSON format")
        },
        async ({ outDir, fileName, quiet, json }) => {
            try {
                let command = `ugs triggers new-file ${outDir} ${fileName}`;
                
                if (quiet) {
                    command += ` -q`;
                }
                if (json) {
                    command += ` -j`;
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
