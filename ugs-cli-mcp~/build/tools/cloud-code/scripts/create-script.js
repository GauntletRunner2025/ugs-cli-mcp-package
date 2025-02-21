import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerCreateScript(server) {
    server.tool("create-script", "Create a new Cloud-Code script", {
        "name": z.string().describe("Name of the script to create"),
        "moduleName": z.string().describe("Name of the module to create the script in"),
        "language": z.enum(['js', 'ts']).optional().describe("Programming language for the script (js or ts)"),
        "params": z.array(z.string()).optional().describe("Parameters for the script"),
        "returnType": z.string().optional().describe("Return type for the script"),
        "template": z.string().optional().describe("Template to use for the script")
    }, async ({ name, moduleName, language, params, returnType, template }) => {
        try {
            let command = `ugs cloud-code scripts create ${name} --module ${moduleName}`;
            if (language) {
                command += ` --language ${language}`;
            }
            if (params && params.length > 0) {
                command += ` --params ${params.join(',')}`;
            }
            if (returnType) {
                command += ` --return-type ${returnType}`;
            }
            if (template) {
                command += ` --template ${template}`;
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
