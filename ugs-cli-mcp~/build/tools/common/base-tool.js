import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
// Common options schema that applies to most UGS CLI commands
export const commonOptionsSchema = {
    "projectId": z.string().optional().describe("The Unity cloud project id"),
    "environmentName": z.string().optional().describe("The services environment name"),
    "help": z.boolean().optional().describe("Show help and usage information"),
    "quiet": z.boolean().optional().describe("Reduce logging to a minimum"),
    "json": z.boolean().optional().describe("Use json as the output format")
};
// Helper to build command options string
export function buildCommandOptions(options) {
    const optionsArray = [];
    if (options.projectId)
        optionsArray.push(`-p ${options.projectId}`);
    if (options.environmentName)
        optionsArray.push(`-e ${options.environmentName}`);
    if (options.help)
        optionsArray.push('--help');
    if (options.quiet)
        optionsArray.push('--quiet');
    if (options.json)
        optionsArray.push('--json');
    return optionsArray.join(' ');
}
// Base class for UGS CLI tools
export class BaseUgsTool {
    server;
    constructor(server) {
        this.server = server;
    }
    async executeCommand(command, options = {}) {
        const fullCommand = `${command} ${buildCommandOptions(options)}`.trim();
        try {
            const { stdout, stderr } = await execAsync(fullCommand);
            return {
                content: [{
                        type: "text",
                        text: stdout.trim() || `Error: ${stderr}`
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: `Error: ${error?.message || String(error)}`
                    }]
            };
        }
    }
    // Helper to register a tool with common options
    registerTool(name, description, specificSchema, handler) {
        return this.server.tool(name, description, { ...specificSchema, ...commonOptionsSchema }, handler);
    }
}
