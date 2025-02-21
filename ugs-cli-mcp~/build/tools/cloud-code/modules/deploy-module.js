import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
import * as path from 'path';
import * as fs from 'fs';
const execAsync = promisify(exec);
export function registerDeployModule(server) {
    server.tool("deploy-module", "Deploy one or more Cloud Code modules (.ccm files)", {
        "modulePaths": z.array(z.string()).describe("Paths to the .ccm module files to deploy"),
        "environment": z.string().optional().describe("Target environment to deploy to")
    }, async ({ modulePaths, environment }, _extra) => {
        try {
            // Validate all paths exist and are .ccm files
            for (const modulePath of modulePaths) {
                if (!fs.existsSync(modulePath)) {
                    return {
                        isError: true,
                        content: [{ type: "text", text: `Module file not found: ${modulePath}` }]
                    };
                }
                if (path.extname(modulePath) !== '.ccm') {
                    return {
                        isError: true,
                        content: [{ type: "text", text: `Invalid file extension for module: ${modulePath}. Must be .ccm` }]
                    };
                }
                // Check file size limit (10MB)
                const stats = fs.statSync(modulePath);
                const fileSizeInMB = stats.size / (1024 * 1024);
                if (fileSizeInMB > 10) {
                    return {
                        isError: true,
                        content: [{ type: "text", text: `Module file exceeds 10MB limit: ${modulePath}` }]
                    };
                }
            }
            // Construct the command
            let command = `ugs cloud-code modules deploy ${modulePaths.join(' ')}`;
            if (environment) {
                command += ` --environment ${environment}`;
            }
            // Execute the command
            const { stdout, stderr } = await execAsync(command);
            return {
                content: [{ type: "text", text: stdout.trim() || `Error: ${stderr}` }]
            };
        }
        catch (error) {
            return {
                isError: true,
                content: [{ type: "text", text: `Error: ${error?.message || String(error)}` }]
            };
        }
    });
}
