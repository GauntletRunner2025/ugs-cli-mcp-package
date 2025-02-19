using UnityEngine;
using UnityEditor;
using System.IO;
using Newtonsoft.Json;
using Gauntletrunner2025.UgsCliMcp.Editor.Models;
using Gauntletrunner2025.UgsCliMcp.Editor.Utilities;
using System.Linq;

namespace Gauntletrunner2025.UgsCliMcp.Editor.Commands
{
    public static class CheckMcpConfigCommand
    {
        [MenuItem("Tools/UGS CLI MCP/Check MCP Config")]
        private static void Execute()
        {
            string userFolder = System.Environment.GetFolderPath(System.Environment.SpecialFolder.UserProfile);
            string configPath = Path.Combine(userFolder, ".codeium", "windsurf-next", "mcp_config.json");

            if (File.Exists(configPath))
            {
                Debug.Log($"MCP config file found at: {configPath}");
                try
                {
                    string jsonContent = File.ReadAllText(configPath);
                    var config = JsonConvert.DeserializeObject<McpConfig>(jsonContent);

                    if (config?.McpServers != null)
                    {
                        bool hasUgsCliMcp = config.McpServers.Keys.Any(McpConfigUtility.IsUgsCliMcpServer);
                        if (hasUgsCliMcp)
                        {
                            var serverConfig = config.McpServers.First(kvp => McpConfigUtility.IsUgsCliMcpServer(kvp.Key)).Value;
                            Debug.Log($"UGS CLI MCP server is installed and configured:");
                            Debug.Log($"  Command: {serverConfig.Command}");
                            Debug.Log($"  Args: {string.Join(", ", serverConfig.Args)}");
                        }
                        else
                        {
                            Debug.LogWarning("UGS CLI MCP server is not configured in the MCP config file. Adding configuration...");
                            McpConfigUtility.AddServerToConfig(config, configPath);
                        }
                    }
                    else
                    {
                        Debug.LogWarning("No MCP servers configured in the config file. Adding configuration...");
                        config.McpServers = new System.Collections.Generic.Dictionary<string, McpServerConfig>();
                        McpConfigUtility.AddServerToConfig(config, configPath);
                    }
                }
                catch (JsonException ex)
                {
                    Debug.LogError($"Failed to parse MCP config file: {ex.Message}");
                }
                catch (IOException ex)
                {
                    Debug.LogError($"Failed to read MCP config file: {ex.Message}");
                }
            }
            else
            {
                Debug.Log($"MCP config file not found at: {configPath}. Creating new config file...");
                McpConfigUtility.CreateNewConfigFile(configPath);
            }
        }
    }
}
