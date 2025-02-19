using UnityEngine;
using UnityEditor;
using System.Diagnostics;
using System.IO;

namespace Gauntletrunner2025.UgsCliMcp.Editor
{
    public static class MenuCommands
    {
        private const string WelcomeMessageShownKey = "UgsCliMcp_WelcomeMessageShown";

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
                Arguments = "/K ugs login",
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

        internal static string WelcomeMessageKey => WelcomeMessageShownKey;
    }
}