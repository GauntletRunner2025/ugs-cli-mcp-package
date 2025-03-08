using UnityEngine;
using System;
using System.IO;
using Newtonsoft.Json;
using UnityEditor;

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
    
    /// <summary>
    /// Checks if the UGS CLI MCP server in the config file points to the current package.
    /// </summary>
    /// <param name="config">The MCP configuration to check</param>
    /// <returns>True if the server points to the current package, false otherwise</returns>
    public static bool IsUgsCliMcpServerPointingToCurrentPackage(McpConfig config)
    {
        if (config?.McpServers == null || !config.McpServers.TryGetValue(UgsCliMcpServerKey, out var serverConfig))
        {
            return false;
        }
        
        if (serverConfig.Args == null || serverConfig.Args.Count == 0)
        {
            return false;
        }
        
        // Get the configured path from the args
        string configuredPath = serverConfig.Args[0];
        if (string.IsNullOrEmpty(configuredPath))
        {
            return false;
        }
        
        try
        {
            // Get the current package path
            string currentPackagePath = PackagePathUtility.GetPackagePath();
            if (string.IsNullOrEmpty(currentPackagePath))
            {
                return false;
            }
            
            // Construct the expected path to index.js
            string expectedPath = Path.Combine(currentPackagePath, "ugs-cli-mcp~", "build", "index.js");
            
            // Normalize paths for comparison (handle different slashes)
            configuredPath = Path.GetFullPath(configuredPath);
            expectedPath = Path.GetFullPath(expectedPath);
            
            // Compare the paths
            return string.Equals(configuredPath, expectedPath, StringComparison.OrdinalIgnoreCase);
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error checking if UGS CLI MCP server points to current package: {ex.Message}");
            return false;
        }
    }
    
    /// <summary>
    /// Loads the MCP configuration from the global config file.
    /// </summary>
    /// <returns>The loaded MCP configuration, or null if it couldn't be loaded</returns>
    public static McpConfig LoadGlobalConfig()
    {
        try
        {
            string userProfilePath = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            string globalConfigPath = Path.Combine(userProfilePath, ConfigSubPath, GlobalConfigFileName);
            
            if (!File.Exists(globalConfigPath))
            {
                return null;
            }
            
            string jsonContent = File.ReadAllText(globalConfigPath);
            return JsonConvert.DeserializeObject<McpConfig>(jsonContent);
        }
        catch (Exception ex)
        {
            Debug.LogError($"Failed to load MCP config: {ex.Message}");
            return null;
        }
    }
}
