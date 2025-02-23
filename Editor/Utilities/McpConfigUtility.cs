using UnityEngine;
using System;
using System.IO;
using Newtonsoft.Json;
using Gauntletrunner2025.UgsCliMcp.Editor.Models;
using UnityEditor;

namespace Gauntletrunner2025.UgsCliMcp.Editor.Utilities
{
    public static class McpConfigUtility
    {
        private const string UgsCliMcpServerKey = "ugs-cli-mcp";
        public const string GlobalConfigFileName = "mcp_config.json";
        public static string ConfigSubPath = System.IO.Path.Combine(".codeium", "windsurf-next");

        [MenuItem("Tools/UGS CLI MCP/Windsurf/Open MCP Config")]
        public static void OpenGlobalConfig()
        {
            string userProfilePath = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            string globalConfigPath = Path.Combine(userProfilePath, ConfigSubPath, GlobalConfigFileName);

            // Ensure the directory exists
            Directory.CreateDirectory(Path.GetDirectoryName(globalConfigPath));

            if (!File.Exists(globalConfigPath))
            {
                if (EditorUtility.DisplayDialog("Config Not Found",
                    $"Global config file not found at {globalConfigPath}. Would you like to create it?",
                    "Yes", "No"))
                {
                    CreateNewConfigFile(globalConfigPath);
                }
                else
                {
                    return;
                }
            }

            // Open the file in the system's default JSON editor
            EditorUtility.OpenWithDefaultApp(globalConfigPath);
        }

        public static void CreateNewConfigFile(string configPath)
        {
            try
            {
                var config = new McpConfig
                {
                    McpServers = new System.Collections.Generic.Dictionary<string, McpServerConfig>()
                };

                AddServerToConfig(config, configPath);
            }
            catch (IOException ex)
            {
                Debug.LogError($"Failed to create MCP config file: {ex.Message}");
            }
        }

        public static void AddServerToConfig(McpConfig config, string configPath)
        {
            try
            {
                string packagePath = PackagePathUtility.GetPackagePath();
                if (string.IsNullOrEmpty(packagePath))
                {
                    throw new Exception("Failed to find package path for UGS CLI MCP");
                }

                // The index.js will be in the build directory of our package
                string ugsCliMcpPath = Path.Combine(packagePath, "ugs-cli-mcp~", "build", "index.js");
                if (!File.Exists(ugsCliMcpPath))
                {
                    Debug.LogWarning($"UGS CLI MCP index.js not found at expected path: {ugsCliMcpPath}");
                }

                var serverConfig = new McpServerConfig
                {
                    Command = "node",
                    Args = new System.Collections.Generic.List<string> { ugsCliMcpPath }
                };

                config.McpServers[UgsCliMcpServerKey] = serverConfig;

                // Create a backup of the existing config file
                McpConfigBackupUtility.CreateBackup(configPath);

                string jsonContent = JsonConvert.SerializeObject(config, Formatting.Indented);
                File.WriteAllText(configPath, jsonContent);

                Debug.Log($"Successfully added UGS CLI MCP server configuration to: {configPath}");
                Debug.Log($"  Command: {serverConfig.Command}");
                Debug.Log($"  Args: {string.Join(", ", serverConfig.Args)}");
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to add server configuration: {ex.Message}");
            }
        }

        public static bool IsUgsCliMcpServer(string serverKey) => serverKey == UgsCliMcpServerKey;
    }
}
