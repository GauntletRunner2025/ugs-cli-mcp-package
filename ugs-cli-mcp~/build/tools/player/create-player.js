import { exec } from "child_process";
import { promisify } from "util";
import * as fs from 'fs';
import * as path from 'path';
const execAsync = promisify(exec);
// Helper function to create a delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// Helper function to write to log file
const writeToLog = async (data) => {
    try {
        // Use absolute path to ensure logs directory is created in the right place
        const logDir = path.resolve(process.cwd(), 'logs');
        const logFile = path.join(logDir, 'create-player.log');
        console.log(`Writing logs to: ${logFile}`);
        // Ensure log directory exists
        if (!fs.existsSync(logDir)) {
            console.log(`Creating log directory: ${logDir}`);
            fs.mkdirSync(logDir, { recursive: true });
        }
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${JSON.stringify(data, null, 2)}\n`;
        await fs.promises.appendFile(logFile, logEntry);
        console.log('Log entry written successfully');
        return true;
    }
    catch (error) {
        console.error('Error writing to log:', error);
        return false;
    }
};
export function registerCreatePlayer(server) {
    server.tool("create-player", "Create an anonymous player account", async () => {
        console.log('Starting create-player tool execution');
        try {
            console.log('Executing UGS player create command');
            const { stdout, stderr } = await execAsync('ugs player create --json');
            console.log('Command executed, raw stdout:', stdout);
            // Add a delay of 1 second before processing the output
            await sleep(1000);
            if (stderr) {
                console.error('Error output from command:', stderr);
            }
            // Split the output into lines and skip the first 'null' line
            const lines = stdout.split('\n').filter(line => line.trim() !== 'null');
            const jsonText = lines.join('\n').trim();
            console.log('Processed output for parsing:', jsonText);
            try {
                const jsonOutput = JSON.parse(jsonText);
                console.log('Successfully parsed JSON output');
                // Try to write to log and capture success/failure
                const logSuccess = await writeToLog(jsonOutput);
                if (!logSuccess) {
                    console.warn('Failed to write to log file, but continuing execution');
                }
                return {
                    content: [{
                            type: "text",
                            text: `Player created successfully: ${JSON.stringify(jsonOutput, null, 2)}`
                        }]
                };
            }
            catch (parseError) {
                console.error('JSON parsing error:', parseError);
                // If JSON parsing fails, return the full output except the null line
                return {
                    content: [{
                            type: "text",
                            text: `Received output (could not parse as JSON): ${jsonText}`
                        }]
                };
            }
        }
        catch (error) {
            console.error('Execution error:', error);
            return {
                content: [{
                        type: "text",
                        text: `Error creating player: ${error?.message || String(error)}`
                    }]
            };
        }
    });
}
