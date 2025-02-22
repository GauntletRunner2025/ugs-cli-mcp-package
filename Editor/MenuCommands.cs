using UnityEngine;
using UnityEditor;
using System.Diagnostics;
using System.IO;

namespace Gauntletrunner2025.UgsCliMcp.Editor
{
    public static class MenuCommands
    {
        private const string WelcomeMessageShownKey = "UgsCliMcp_WelcomeMessageShown";
        private const string EnvironmentNameKey = "UgsCliMcp_EnvironmentName";
        private const string ServiceRoleInstructionsLink = @"https://docs.unity.com/ugs/en-us/manual/game-server-hosting/manual/concepts/authentication-service-accounts";
        private const string LoginInstructions = @"echo Welcome to UGS CLI MCP Login! && echo. && " +
            @"echo Go to " + ServiceRoleInstructionsLink + " && " +
            @"echo Follow their instructions to create a service role account and key. && " +
            @"echo You will need the key id and secret to use with the ugs-cli tool. && " +
            @"ugs login";

        [InitializeOnLoadMethod]
        private static void Initialize()
        {
            if (!EditorPrefs.HasKey(WelcomeMessageShownKey))
            {
                UnityEngine.Debug.Log("Welcome to UGS CLI MCP! This message will only show once.");
                EditorPrefs.SetBool(WelcomeMessageShownKey, true);
            }
        }

        [MenuItem("Tools/UGS CLI MCP/Login")]
        private static void OpenUgsLogin()
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = "cmd.exe",
                Arguments = $"/K {LoginInstructions}",
                UseShellExecute = true,
                CreateNoWindow = false
            };

            try
            {
                Process.Start(startInfo);
            }
            catch (System.Exception ex)
            {
                UnityEngine.Debug.LogError($"Failed to start UGS login process: {ex.Message}");
            }
        }

        [MenuItem("Tools/UGS CLI MCP/Configure Project")]
        private static void ConfigureProject()
        {
            string projectId = CloudProjectSettings.projectId;
            if (string.IsNullOrEmpty(projectId))
            {
                EditorUtility.DisplayDialog("Configure Project", 
                    "No project ID found. Please make sure you have linked this project to Unity Cloud Services.", 
                    "OK");
                return;
            }

            string currentEnv = EditorPrefs.GetString(EnvironmentNameKey, "production");
            string environment = EditorInputDialog.Show("Configure Project", 
                "Enter the environment name:", 
                currentEnv);

            if (!string.IsNullOrEmpty(environment))
            {
                EditorPrefs.SetString(EnvironmentNameKey, environment);
                UnityEngine.Debug.Log($"Project configuration set:\nProject ID: {projectId}\nEnvironment: {environment}");
            }
        }

        internal static string WelcomeMessageKey => WelcomeMessageShownKey;
        internal static string GetEnvironmentName() => EditorPrefs.GetString(EnvironmentNameKey, "production");
        internal static string GetProjectId() => CloudProjectSettings.projectId;
    }
}