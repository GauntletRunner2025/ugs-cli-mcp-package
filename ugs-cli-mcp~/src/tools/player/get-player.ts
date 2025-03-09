import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { writeToLog, LogType } from "../../utils/logger.js";

const execAsync = promisify(exec);

export function registerGetPlayer(server: McpServer) {
    server.tool(
        "get-player",
        "Shows an existing player account information",
        {
            "playerId": z.string().describe("The ID of the player to retrieve")
        },
        async ({ playerId }) => {
            try {
                const { stdout, stderr } = await execAsync(`ugs player get ${playerId} --json`);

                await writeToLog(stdout, LogType.STDOUT);
                await writeToLog(stderr, LogType.STDERR);

                return {
                    content: [{ type: "text", text: stdout }]
                };

            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Error: ${error?.message || String(error)}` }]
                };
            }
        }
    );
}
