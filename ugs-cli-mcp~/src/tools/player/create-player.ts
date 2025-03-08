import { exec } from "child_process";
import { promisify } from "util";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// Helper function to create a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to write to log file
const writeToLog = async (data: any) => {
    const logDir = path.join(__dirname, '../../../logs');
    const logFile = path.join(logDir, 'create-player.log');

    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${JSON.stringify(data, null, 2)}\n`;

    await fs.promises.appendFile(logFile, logEntry);
};

export function registerCreatePlayer(server: McpServer) {
    server.tool(
        "create-player",
        "Create an anonymous player account",
        async () => {
            try {
                const { stdout, stderr } = await execAsync('ugs player create --json');

                // Add a delay of 1 second before processing the output
                await sleep(2000);

                if (stderr) {
                    console.error('Error output:', stderr);
                }

                // Split the output into lines and skip the first 'null' line
                const lines = stdout.split('\n').filter(line => line.trim() !== 'null');
                const jsonText = lines.join('\n').trim();

                try {
                    const jsonOutput = JSON.parse(jsonText);
                    // console.log('Parsed output:', jsonOutput);
                    await writeToLog(jsonOutput);
                    return {
                        content: [{ type: "text", text: JSON.stringify(jsonOutput, null, 2) }]
                    };
                } catch (parseError) {
                    // If JSON parsing fails, return the full output except the null line
                    console.log('Raw output:', jsonText);
                    return {
                        content: [{ type: "text", text: jsonText }]
                    };
                }

            } catch (error: any) {
                console.error('Execution error:', error);
                return {
                    content: [{ type: "text", text: `Error: ${error?.message || String(error)}` }]
                };
            }
        }
    );
}
