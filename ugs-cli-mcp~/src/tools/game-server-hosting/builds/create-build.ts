import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerCreateBuild(server: McpServer) {
    server.tool(
        "create-build",
        "Create a new build",
        {
            "name": z.string().describe("Name of the build"),
            "filePath": z.string().describe("Path to the build file"),
            "version": z.string().optional().describe("Version number for the build"),
            "notes": z.string().optional().describe("Notes for this build")
        },
        async ({ name, filePath, version, notes }) => {
            try {
                let command = `ugs gsh build create ${name} ${filePath}`;
                
                if (version) {
                    command += ` --version ${version}`;
                }
                if (notes) {
                    command += ` --notes "${notes}"`;
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
