import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { writeToLog, LogType } from "../../utils/logger.js";

const execAsync = promisify(exec);

export function registerCreatePlayer(server: McpServer) {
    server.tool(
        "create-player",
        "Create an anonymous player account",
        async () => {
            try {
                // Execute the UGS CLI command
                const { stdout, stderr } = await execAsync('ugs player create --json');

                if (stdout) await writeToLog(stdout, LogType.STDOUT);
                if (stderr) await writeToLog(stderr, LogType.STDERR);

                return {
                    content: [{
                        type: "text",
                        text: stderr
                    }]
                };

            } catch (error: any) {
                return {
                    content: [{
                        type: "text",
                        text: `Error creating player`
                    }]
                };
            }
        }
    );
}
