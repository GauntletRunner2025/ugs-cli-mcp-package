import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerGetVersionHandler } from "./tools/get-version.js";
import { registerListCustomDataIDs } from "./tools/cloud-save/list-custom-data-ids.js";
import { registerCreateCustomIndex } from "./tools/cloud-save/create-custom-index.js";
import { registerCreatePlayer } from "./tools/player/create-player.js";
import { registerDeletePlayer } from "./tools/player/delete-player.js";
import { registerDisablePlayer } from "./tools/player/disable-player.js";
import { registerEnablePlayer } from "./tools/player/enable-player.js";
import { registerGetPlayer } from "./tools/player/get-player.js";
import { registerListPlayer } from "./tools/player/list-player.js";

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

  // Connect to transport and start
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
