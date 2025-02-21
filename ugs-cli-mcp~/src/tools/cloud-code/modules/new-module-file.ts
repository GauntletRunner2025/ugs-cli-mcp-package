import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerNewModuleFile(server: McpServer) {
    server.tool(
        "new-module-file",
        "Create a new Cloud-Code module file",
        {
            "name": z.string().describe("Name of the module file to create"),
            "language": z.enum(['js', 'ts']).optional().describe("Programming language for the module (js or ts)"),
            "path": z.string().optional().describe("Path where the module file will be created"),
            "template": z.string().optional().describe("Template to use for the module file")
        },
        async ({ name, language, path, template }) => {
            try {
                let command = `ugs cloud-code modules new-file ${name}`;
                if (language) {
                    command += ` --language ${language}`;
                }
                if (path) {
                    command += ` --path ${path}`;
                }
                if (template) {
                    command += ` --template ${template}`;
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
