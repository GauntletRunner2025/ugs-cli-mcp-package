import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerGetVersionHandler } from "./tools/get-version.js";
//Configuration
import { registerDeleteConfig } from "./tools/configuration/delete-config.js";
import { registerGetConfig } from "./tools/configuration/get-config.js";
import { registerSetConfig } from "./tools/configuration/set-config.js";
async function main() {
    const server = new McpServer({
        name: "weather",
        version: "1.0.0",
    });
    // Register all tools
    registerGetVersionHandler(server);
    // //Cloud save
    // registerListCustomDataIDs(server);
    // registerCreateCustomIndex(server);
    // //Player management
    // registerCreatePlayer(server);
    // registerDeletePlayer(server);
    // registerDisablePlayer(server);
    // registerEnablePlayer(server);
    // registerGetPlayer(server);
    // registerListPlayer(server);
    // //???
    // registerFetch(server);
    // registerLogin(server);
    // registerLogout(server);
    // registerStatus(server);
    //Config
    registerDeleteConfig(server);
    registerGetConfig(server);
    registerSetConfig(server);
    //Access- Not supported
    // registerDeletePlayerPolicyStatements(server);
    // registerDeleteProjectPolicyStatements(server);
    // registerGetAllPlayerPolicies(server);
    // registerGetPlayerPolicy(server);
    // registerGetProjectPolicy(server);
    // registerUpsertPlayerPolicy(server);
    // registerUpsertProjectPolicy(server);
    //Cloud Code- not supported
    // registerDeleteModule(server);
    // registerDeployModule(server);
    // registerExportModule(server);
    // registerGetModule(server);
    // registerImportModule(server);
    // registerListModules(server);
    // registerNewModuleFile(server);
    // //Cloud Code- not supported
    // registerCreateScript(server);
    // registerDeleteScript(server);
    // registerExportScript(server);
    // registerGetScript(server);
    // registerImportScript(server);
    // registerListScripts(server);
    // registerNewScriptFile(server);
    // registerPublishScript(server);
    // registerUpdateScript(server);
    // Connect to transport and start
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
