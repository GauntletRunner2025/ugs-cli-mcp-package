import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
// Helper function to create a delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export function registerCreatePlayer(server) {
    server.tool("create-player", "Create an anonymous player account", async () => {
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
                console.log('Parsed output:', jsonOutput);
                return {
                    content: [{ type: "text", text: JSON.stringify(jsonOutput, null, 2) }]
                };
            }
            catch (parseError) {
                // If JSON parsing fails, return the full output except the null line
                console.log('Raw output:', jsonText);
                return {
                    content: [{ type: "text", text: jsonText }]
                };
            }
        }
        catch (error) {
            console.error('Execution error:', error);
            return {
                content: [{ type: "text", text: `Error: ${error?.message || String(error)}` }]
            };
        }
    });
}
