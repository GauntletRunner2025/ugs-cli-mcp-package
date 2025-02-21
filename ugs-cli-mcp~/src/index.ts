import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerGetVersionHandler } from "./tools/get-version.js";

//Access
import { registerDeletePlayerPolicyStatements } from "./tools/access/delete-player-policy-statements.js";
import { registerDeleteProjectPolicyStatements } from "./tools/access/delete-project-policy-statements.js";
import { registerGetAllPlayerPolicies } from "./tools/access/get-all-player-policies.js";
import { registerGetPlayerPolicy } from "./tools/access/get-player-policy.js";
import { registerGetProjectPolicy } from "./tools/access/get-project-policy.js";
import { registerUpsertPlayerPolicy } from "./tools/access/upsert-player-policy.js";
import { registerUpsertProjectPolicy } from "./tools/access/upsert-project-policy.js";

//Cloud Save
import { registerListCustomDataIDs } from "./tools/cloud-save/list-custom-data-ids.js";
import { registerCreateCustomIndex } from "./tools/cloud-save/create-custom-index.js";
import { registerCreatePlayer } from "./tools/player/create-player.js";
import { registerDeletePlayer } from "./tools/player/delete-player.js";
import { registerDisablePlayer } from "./tools/player/disable-player.js";
import { registerEnablePlayer } from "./tools/player/enable-player.js";
import { registerGetPlayer } from "./tools/player/get-player.js";
import { registerListPlayer } from "./tools/player/list-player.js";
import { registerFetch } from "./tools/fetch.js";
import { registerLogin } from "./tools/login.js";
import { registerLogout } from "./tools/logout.js";
import { registerStatus } from "./tools/status.js";

async function main() {
  const server = new McpServer({
    name: "weather",
    version: "1.0.0",
  });

  // Register all tools
  registerGetVersionHandler(server);
  registerListCustomDataIDs(server);
  registerCreateCustomIndex(server);
  registerCreatePlayer(server);
  registerDeletePlayer(server);
  registerDisablePlayer(server);
  registerEnablePlayer(server);
  registerGetPlayer(server);
  registerListPlayer(server);
  registerFetch(server);
  registerLogin(server);
  registerLogout(server);
  registerStatus(server);

  //Access
  registerDeletePlayerPolicyStatements(server);
  registerDeleteProjectPolicyStatements(server);
  registerGetAllPlayerPolicies(server);
  registerGetPlayerPolicy(server);
  registerGetProjectPolicy(server);
  registerUpsertPlayerPolicy(server);
  registerUpsertProjectPolicy(server);


  // Connect to transport and start
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
