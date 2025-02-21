import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerImportModule(server) {
    server.tool("import-module", "Import a Cloud-Code module from a file", {
        "filePath": z.string().describe("Path to the module file to import"),
        "moduleName": z.string().optional().describe("Optional name for the imported module"),
        "overwrite": z.boolean().optional().describe("Whether to overwrite an existing module with the same name")
    }, async ({ filePath, moduleName, overwrite }) => {
        try {
            let command = `ugs cloud-code modules import ${filePath}`;
            if (moduleName) {
                command += ` --name ${moduleName}`;
            }
            if (overwrite) {
                command += ` --overwrite`;
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
