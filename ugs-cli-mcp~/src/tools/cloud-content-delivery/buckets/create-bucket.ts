import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const execAsync = promisify(exec);

export function registerCreateBucket(server: McpServer) {
    server.tool(
        "create-bucket",
        "Create a new bucket",
        {
            "name": z.string().describe("Name of the bucket"),
            "labels": z.array(z.string()).optional().describe("Labels to add to the bucket"),
            "description": z.string().optional().describe("Description of the bucket")
        },
        async ({ name, labels, description }) => {
            try {
                let command = `ugs ccd buckets create ${name}`;
                
                if (labels && labels.length > 0) {
                    command += ` --labels ${labels.join(',')}`;
                }
                
                if (description) {
                    command += ` --description "${description}"`;
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
