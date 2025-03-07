using UnityEngine;
using UnityEditor;
using System;
using System.IO;

namespace GauntletRunner2025.UgsCliMcp.Editor.Utilities
{
    public static class McpConfigBackupUtility
    {
        [MenuItem("Tools/UGS CLI MCP/Windsurf/Revert to Backup Config", validate = true)]
        public static bool ValidateRevertToBackup()
        {
            string userProfilePath = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            string globalConfigPath = Path.Combine(userProfilePath, McpConfigUtility.ConfigSubPath, McpConfigUtility.GlobalConfigFileName);
            string backupPath = globalConfigPath + ".backup";
            return File.Exists(backupPath);
        }

        [MenuItem("Tools/UGS CLI MCP/Windsurf/Revert to Backup Config")]
        public static void RevertToBackupConfig()
        {
            string userProfilePath = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            string globalConfigPath = Path.Combine(userProfilePath, McpConfigUtility.ConfigSubPath, McpConfigUtility.GlobalConfigFileName);
            string backupPath = globalConfigPath + ".backup";

            if (!File.Exists(backupPath))
            {
                EditorUtility.DisplayDialog("No Backup Found", 
                    "No backup config file was found to revert to.", 
                    "OK");
                return;
            }

            if (EditorUtility.DisplayDialog("Revert Config",
                "Are you sure you want to revert to the backup config? This will overwrite your current config file.",
                "Yes", "No"))
            {
                try
                {
                    File.Copy(backupPath, globalConfigPath, true);
                    Debug.Log($"Successfully reverted config to backup from: {backupPath}");
                    EditorUtility.DisplayDialog("Success", 
                        "Successfully reverted to backup config.", 
                        "OK");
                }
                catch (Exception ex)
                {
                    Debug.LogError($"Failed to revert to backup config: {ex.Message}");
                    EditorUtility.DisplayDialog("Error", 
                        $"Failed to revert to backup config: {ex.Message}", 
                        "OK");
                }
            }
        }

        public static void CreateBackup(string configPath)
        {
            if (File.Exists(configPath))
            {
                string backupPath = configPath + ".backup";
                File.Copy(configPath, backupPath, true);
                Debug.Log($"Created backup of existing config at: {backupPath}");
            }
        }
    }
}
