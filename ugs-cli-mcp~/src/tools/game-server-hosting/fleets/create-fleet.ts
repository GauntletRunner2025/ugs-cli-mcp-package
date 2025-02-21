import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerCreateFleet(server: McpServer) {
    server.tool(
        "create-fleet",
        "Create a new fleet",
        {
            "name": z.string().describe("Name of the fleet"),
            "osFamily": z.string().describe("OS family for the fleet (linux/windows)"),
            "description": z.string().optional().describe("Description of the fleet"),
            "allowedRegions": z.array(z.string()).optional().describe("List of allowed regions")
        },
        async ({ name, osFamily, description, allowedRegions }) => {
            try {
                let command = `ugs gsh fleet create ${name} ${osFamily}`;
                
                if (description) {
                    command += ` --description "${description}"`;
                }
                
                if (allowedRegions && allowedRegions.length > 0) {
                    command += ` --allowed-regions ${allowedRegions.join(',')}`;
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
