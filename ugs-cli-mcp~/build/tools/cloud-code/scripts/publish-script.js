import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerPublishScript(server) {
    server.tool("publish-script", "Publish a Cloud-Code script", {
        "name": z.string().describe("Name of the script to publish"),
        "moduleName": z.string().describe("Name of the module containing the script"),
        "params": z.array(z.string()).optional().describe("Parameters for the script"),
        "returnType": z.string().optional().describe("Return type for the script")
    }, async ({ name, moduleName, params, returnType }) => {
        try {
            let command = `ugs cloud-code scripts publish ${name} --module ${moduleName}`;
            if (params && params.length > 0) {
                command += ` --params ${params.join(',')}`;
            }
            if (returnType) {
                command += ` --return-type ${returnType}`;
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
