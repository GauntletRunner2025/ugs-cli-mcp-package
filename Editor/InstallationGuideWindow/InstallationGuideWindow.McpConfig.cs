using UnityEngine;
using UnityEngine.UIElements;
using UnityEditor;
using System;
using System.IO;
using Newtonsoft.Json;
using Debug = UnityEngine.Debug;
using System.Linq;
using System.Collections.Generic;

    public partial class InstallationGuideWindow
    {
        private Button checkMcpConfigButton;
        private Button addMcpServerButton;
        private Label mcpConfigResultLabel;

        private void SetupMcpConfigUI()
        {
            checkMcpConfigButton = rootVisualElement.Q<Button>("check-mcp-config-button");
            addMcpServerButton = rootVisualElement.Q<Button>("add-mcp-server-button");
            mcpConfigResultLabel = rootVisualElement.Q<Label>("mcp-config-result");

            checkMcpConfigButton.clicked += CheckMcpConfig;
            addMcpServerButton.clicked += AddMcpServer;
        }

        private void CheckMcpConfig()
        {
            checkMcpConfigButton.SetEnabled(false);
            addMcpServerButton.style.display = DisplayStyle.None;
            mcpConfigResultLabel.text = "Checking MCP configuration...";
            mcpConfigResultLabel.style.color = Color.white;

            try
            {
                string userFolder = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
                string configPath = Path.Combine(userFolder, ".codeium", "windsurf-next", "mcp_config.json");

                if (File.Exists(configPath))
                {
                    LogDebug($"MCP config file found at: {configPath}", true);
                    string jsonContent = File.ReadAllText(configPath);
                    var config = JsonConvert.DeserializeObject<McpConfig>(jsonContent);

                    if (config?.McpServers != null)
                    {
                        bool hasUgsCliMcp = config.McpServers.Keys.Any(McpConfigUtility.IsUgsCliMcpServer);
                        if (hasUgsCliMcp)
                        {
                            // Check if the server points to the current package
                            bool pointsToCurrentPackage = McpConfigUtility.IsUgsCliMcpServerPointingToCurrentPackage(config);
                            
                            if (pointsToCurrentPackage)
                            {
                                mcpConfigResultLabel.text = "✓ UGS CLI MCP server is correctly configured";
                                mcpConfigResultLabel.style.color = new Color(0.2f, 0.8f, 0.2f);
                                stepManager.SetStepCompletion(true);
                            }
                            else
                            {
                                mcpConfigResultLabel.text = "UGS CLI MCP server exists but points to a different package version.";
                                mcpConfigResultLabel.style.color = Color.yellow;
                                addMcpServerButton.style.display = DisplayStyle.Flex;
                                stepManager.SetStepCompletion(false);
                            }
                        }
                        else
                        {
                            mcpConfigResultLabel.text = "MCP config exists but UGS CLI MCP server is not configured.";
                            mcpConfigResultLabel.style.color = Color.yellow;
                            addMcpServerButton.style.display = DisplayStyle.Flex;
                            stepManager.SetStepCompletion(false);
                        }
                    }
                    else
                    {
                        mcpConfigResultLabel.text = "Invalid MCP config format.";
                        mcpConfigResultLabel.style.color = Color.yellow;
                        addMcpServerButton.style.display = DisplayStyle.Flex;
                        stepManager.SetStepCompletion(false);
                    }
                }
                else
                {
                    mcpConfigResultLabel.text = "MCP config file not found.";
                    mcpConfigResultLabel.style.color = Color.yellow;
                    addMcpServerButton.style.display = DisplayStyle.Flex;
                    stepManager.SetStepCompletion(false);
                }
            }
            catch (Exception ex)
            {
                LogDebug($"Error checking MCP config: {ex}", false);
                mcpConfigResultLabel.text = $"Error checking MCP config: {ex.Message}";
                mcpConfigResultLabel.style.color = new Color(0.8f, 0.2f, 0.2f);
                stepManager.SetStepCompletion(false);
            }
            finally
            {
                checkMcpConfigButton.SetEnabled(true);
            }
        }

        private void AddMcpServer()
        {
            addMcpServerButton.SetEnabled(false);
            mcpConfigResultLabel.text = "Adding UGS CLI MCP server...";
            mcpConfigResultLabel.style.color = Color.white;

            try
            {
                string userFolder = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
                string configPath = Path.Combine(userFolder, ".codeium", "windsurf-next", "mcp_config.json");

                // Create config directory if it doesn't exist
                Directory.CreateDirectory(Path.GetDirectoryName(configPath));

                // Load or create config
                McpConfig config;
                if (File.Exists(configPath))
                {
                    string jsonContent = File.ReadAllText(configPath);
                    config = JsonConvert.DeserializeObject<McpConfig>(jsonContent);
                }
                else
                {
                    config = new McpConfig { McpServers = new Dictionary<string, McpServerConfig>() };
                }

                // Add our server
                var serverConfig = new McpServerConfig
                {
                    Command = "node",
                    Args = new List<string>
                    {
                        Path.Combine(PackagePathUtility.GetPackagePath(), "ugs-cli-mcp~", "build", "index.js").Replace("/", "\\")
                    }
                };

                if (config.McpServers == null)
                {
                    config.McpServers = new Dictionary<string, McpServerConfig>();
                }

                config.McpServers["ugs-cli-mcp"] = serverConfig;

                // Save config
                string newJsonContent = JsonConvert.SerializeObject(config, Formatting.Indented);
                File.WriteAllText(configPath, newJsonContent);

                mcpConfigResultLabel.text = "✓ MCP server added successfully";
                mcpConfigResultLabel.style.color = new Color(0.2f, 0.8f, 0.2f);
                addMcpServerButton.style.display = DisplayStyle.None;
                LogDebug("MCP server added successfully, completing step", false);
                stepManager.SetStepCompletion(true);

                // Re-check config to verify
                CheckMcpConfig();
            }
            catch (Exception ex)
            {
                LogDebug($"Error adding MCP server: {ex}", false);
                mcpConfigResultLabel.text = $"Error adding MCP server: {ex.Message}";
                mcpConfigResultLabel.style.color = new Color(0.8f, 0.2f, 0.2f);
                stepManager.SetStepCompletion(false);
            }
            finally
            {
                addMcpServerButton.SetEnabled(true);
            }
        }
    }