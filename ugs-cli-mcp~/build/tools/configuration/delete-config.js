import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerDeleteConfig(server) {
    server.tool("delete-config", "Delete the value of a key in configuration. You must call this command with the --key <key> option or with the --all option.", {
        "key": z.string().optional().describe("A key in configuration"),
        "all": z.boolean().optional().describe("Target all keys in configuration"),
        "force": z.boolean().optional().describe("Force an operation"),
        "help": z.boolean().optional().describe("Display help and usage information"),
        "quiet": z.boolean().optional().describe("Reduce logging to a minimum"),
        "json": z.boolean().optional().describe("Use JSON as the output format")
    }, async ({ key, all, force, help, quiet, json }) => {
        try {
            let command = `ugs config delete`;
            if (key)
                command += ` -k "${key}"`;
            if (all)
                command += ` -a`;
            if (force)
                command += ` -f`;
            if (help)
                command += ` -h`;
            if (quiet)
                command += ` -q`;
            if (json)
                command += ` -j`;
            const { stdout, stderr } = await execAsync(command);
            return {
                content: [{ type: "text", text: stdout.trim() || `Error: ${stderr}` }]
            };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Error: ${error?.message || String(error)}` }]
            };
        }
    });
}
