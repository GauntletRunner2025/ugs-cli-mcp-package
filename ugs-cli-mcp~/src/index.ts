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

//cloud-code
import { registerDeleteModule } from "./tools/cloud-code/modules/delete-module.js";
import { registerDeployModule } from "./tools/cloud-code/modules/deploy-module.js";
import { registerExportModule } from "./tools/cloud-code/modules/export-module.js";
import { registerGetModule } from "./tools/cloud-code/modules/get-module.js";
import { registerImportModule } from "./tools/cloud-code/modules/import-module.js";
import { registerListModules } from "./tools/cloud-code/modules/list-modules.js";
import { registerNewModuleFile } from "./tools/cloud-code/modules/new-module-file.js";

import { registerCreateScript } from "./tools/cloud-code/scripts/create-script.js";
import { registerDeleteScript } from "./tools/cloud-code/scripts/delete-script.js";
import { registerExportScript } from "./tools/cloud-code/scripts/export-script.js";
import { registerGetScript } from "./tools/cloud-code/scripts/get-script.js";
import { registerImportScript } from "./tools/cloud-code/scripts/import-script.js";
import { registerNewScriptFile } from "./tools/cloud-code/scripts/new-script-file.js";
import { registerPublishScript } from "./tools/cloud-code/scripts/publish-script.js";
import { registerUpdateScript } from "./tools/cloud-code/scripts/update-script.js";
import { registerListScripts } from "./tools/cloud-code/scripts/list-scripts.js";

//Cloud-content-delivery
import { registerUpdateBucketPermissions } from "./tools/cloud-content-delivery/buckets/permissions/update-bucket-permissions.js";
import { registerCreateBadge } from "./tools/cloud-content-delivery/badges/create-badge.js";
import { registerDeleteBadge } from "./tools/cloud-content-delivery/badges/delete-badge.js";
import { registerListBadges } from "./tools/cloud-content-delivery/badges/list-badges.js";
import { registerCreateBucket } from "./tools/cloud-content-delivery/buckets/create-bucket.js";
import { registerDeleteBucket } from "./tools/cloud-content-delivery/buckets/delete-bucket.js";
import { registerGetBucketInfo } from "./tools/cloud-content-delivery/buckets/get-bucket-info.js";
import { registerListBuckets } from "./tools/cloud-content-delivery/buckets/list-buckets.js";

import { registerCopyEntry } from "./tools/cloud-content-delivery/entries/copy-entry.js";
import { registerDeleteEntry } from "./tools/cloud-content-delivery/entries/delete-entry.js";
import { registerDownloadEntry } from "./tools/cloud-content-delivery/entries/download-entry.js";
import { registerGetEntryInfo } from "./tools/cloud-content-delivery/entries/get-entry-info.js";
import { registerListEntries } from "./tools/cloud-content-delivery/entries/list-entries.js";
import { registerSyncEntries } from "./tools/cloud-content-delivery/entries/sync-entries.js";
import { registerUpdateEntry } from "./tools/cloud-content-delivery/entries/update-entry.js";

import { registerGetPromotionStatus } from "./tools/cloud-content-delivery/releases/promotions/get-promotion-status.js";
import { registerCreateRelease } from "./tools/cloud-content-delivery/releases/create-release.js";
import { registerGetReleaseInfo } from "./tools/cloud-content-delivery/releases/get-release-info.js";
import { registerListReleases } from "./tools/cloud-content-delivery/releases/list-releases.js";
import { registerPromoteRelease } from "./tools/cloud-content-delivery/releases/promote-release.js";
import { registerUpdateRelease } from "./tools/cloud-content-delivery/releases/update-release.js";

//Cloud Save
import { registerListCustomDataIDs } from "./tools/cloud-save/list-custom-data-ids.js";
import { registerCreateCustomIndex } from "./tools/cloud-save/create-custom-index.js";

//Configuration
import { registerDeleteConfig } from "./tools/configuration/delete-config.js";
import { registerGetConfig } from "./tools/configuration/get-config.js";
import { registerSetConfig } from "./tools/configuration/set-config.js";

//Economy
import { registerGetPublished } from "./tools/economy/get-published.js";
import { registerGetResources } from "./tools/economy/get-resources.js";
import { registerNewFile } from "./tools/economy/new-file.js";
import { registerPublish } from "./tools/economy/publish.js";

//Environment
import { registerAddEnvironment } from "./tools/environment/add-environment.js";
import { registerDeleteEnvironment } from "./tools/environment/delete-environment.js";
import { registerListEnvironments } from "./tools/environment/list-environments.js";
import { registerUseEnvironment } from "./tools/environment/use-environment.js";

//Game Server Hosting
import { registerCreateBuildConfiguration } from "./tools/game-server-hosting/build-configurations/create-build-configuration.js";
import { registerDeleteBuildConfiguration } from "./tools/game-server-hosting/build-configurations/delete-build-configuration.js";
import { registerGetBuildConfiguration } from "./tools/game-server-hosting/build-configurations/get-build-configuration.js";
import { registerListBuildConfigurations } from "./tools/game-server-hosting/build-configurations/list-build-configurations.js";
import { registerUpdateBuildConfiguration } from "./tools/game-server-hosting/build-configurations/update-build-configuration.js";

import { registerCreateBuildVersion } from "./tools/game-server-hosting/builds/create-build-version.js";
import { registerCreateBuild } from "./tools/game-server-hosting/builds/create-build.js";
import { registerDeleteBuild } from "./tools/game-server-hosting/builds/delete-build.js";
import { registerGetBuild } from "./tools/game-server-hosting/builds/get-build.js";
// import{registerListBuildInternals} from "./tools/game-server-hosting/builds/list-build-internals.js";
import { registerListBuilds } from "./tools/game-server-hosting/builds/list-builds.js";
import { registerUpdateBuild } from "./tools/game-server-hosting/builds/update-build.js";
import { registerDeploy } from "./tools/deploy.js";


async function main() {
  const server = new McpServer({
    name: "weather",
    version: "1.0.0",
  });

  // Register all tools
  registerGetVersionHandler(server);

  //Config
  registerDeleteConfig(server);
  registerGetConfig(server);
  registerSetConfig(server);

  //Deploy
  // registerDeploy(server);

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
