import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerNewConfigFile(server) {
    server.tool("new-config-file", "Create a new Remote Config configuration file", {
        "outDir": z.string().describe("Output directory for the configuration file"),
        "fileName": z.string().describe("Name of the configuration file"),
        "quiet": z.boolean().optional().describe("Suppress output"),
        "json": z.boolean().optional().describe("Output in JSON format")
    }, async ({ outDir, fileName, quiet, json }) => {
        try {
            let command = `ugs remote-config new-file ${outDir} ${fileName}`;
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
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Error: ${error?.message || String(error)}` }]
            };
        }
    });
}
