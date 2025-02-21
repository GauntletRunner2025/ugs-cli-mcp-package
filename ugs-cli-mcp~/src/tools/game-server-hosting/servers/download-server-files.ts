import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerDownloadServerFiles(server: McpServer) {
    server.tool(
        "download-server-files",
        "Download server files",
        {
            "serverId": z.string().describe("ID of the server"),
            "filePath": z.string().describe("Path where to save the files"),
            "files": z.array(z.string()).optional().describe("List of specific files to download")
        },
        async ({ serverId, filePath, files }) => {
            try {
                let command = `ugs gsh server files download ${serverId} ${filePath}`;
                
                if (files && files.length > 0) {
                    command += ` --files ${files.join(',')}`;
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
