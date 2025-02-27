import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
export function registerDeploy(server) {
    server.tool("deploy", "The Deploy command is an interface to deploy configuration files of supported services to the backend. Supported services: Remote Config, Cloud Code Scripts, Cloud Code Modules, Economy, Leaderboards, Access, Triggers, Scheduler and Matchmaker.", {
        "projectId": z.string().describe("The Unity cloud project ID."),
        "environment": z.string().describe("The services environment name."),
        "help": z.boolean().optional().describe("Display help and usage information"),
        "quiet": z.boolean().optional().describe("Reduce logging to a minimum"),
        "json": z.boolean().optional().describe("Use JSON as the output format"),
        "reconcile": z.boolean().optional().describe("Content that is not updated will be created at the root"),
        "dryRun": z.boolean().optional().describe("Perform a trial run with no changes made"),
        "services": z.string().optional().describe("The name(s) of the service(s) to perform the command on"),
        "paths": z.array(z.string()).default(["."])
            .describe("The paths to deploy from. Accepts multiple directories or file paths. Defaults to current directory '.'")
    }, async ({ projectId, environment, help, quiet, json, reconcile, dryRun, services, paths }) => {
        try {
            // Start with base command
            let command = `ugs deploy`;
            // Add paths - if paths array is empty or undefined, use "."
            const deployPaths = paths && paths.length > 0 ? paths : ["."];
            command += ` ${deployPaths.join(" ")}`;
            // Add all other options after the paths
            if (projectId)
                command += ` --project-id "${projectId}"`;
            if (environment)
                command += ` -e "${environment}"`;
            if (help)
                command += ` -h`;
            if (quiet)
                command += ` -q`;
            if (json)
                command += ` -j`;
            if (reconcile)
                command += ` --reconcile`;
            if (dryRun)
                command += ` --dry-run`;
            if (services)
                command += ` --services "${services}"`;
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
