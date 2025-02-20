import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
import { validateProjectId } from "../../utils/project-validation.js";
const execAsync = promisify(exec);
export function registerListCustomDataIDs(server) {
    server.tool("help-list-custom-data-ids", "List and explain options for the list-custom-data-ids tool", async () => {
        const helpItems = [
            "environment-name	The services environment name.",
            "limit	The maximum number of custom data IDs to return. If not specified, the default limit of 20 will be used.",
            "start The custom data ID to start the page from. If not specified, the first page will be returned.",
            "help	Display help and usage information.",
            "quiet	Reduce logging to a minimum.",
            "json	Use JSON as the output format."
        ];
        return {
            content: [{ type: "text", text: helpItems.join("\n") }]
        };
    });
    server.tool("list-custom-data-ids", "Get a paginated list of all Game State custom data IDs for a given project and environment.", {
        "limit": z.string(),
    }, async ({ "limit": limit, }) => {
        try {
            const validation = await validateProjectId();
            if (!validation.isValid) {
                return {
                    content: [{ type: "text", text: `[Error]: ${validation.error}` }]
                };
            }
            const ugsCommand = ['ugs', 'cloud-save', 'data', 'custom', 'list'];
            if (limit) {
                ugsCommand.push('--limit', limit);
            }
            const { stdout } = await execAsync(ugsCommand.join(' '));
            return {
                content: [{ type: "text", text: stdout.trim() }]
            };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `[Error]: ${error?.message || String(error)}` }]
            };
        }
    });
}
