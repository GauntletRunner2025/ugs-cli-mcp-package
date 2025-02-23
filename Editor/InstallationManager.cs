using UnityEditor;
using UnityEngine;

namespace Unity.Services.Cli.Mcp.Editor
{
    public static class InstallationManager
    {
        private const string MenuRoot = "MCP Installation/";
        private const string PrefsKeyPrefix = "MCPInstallation_Step";

        [MenuItem(MenuRoot + "Reset All Steps")]
        private static void ResetAllSteps()
        {
            for (int i = 1; i <= 4; i++)
            {
                EditorPrefs.SetBool($"{PrefsKeyPrefix}{i}", false);
            }
            Debug.Log("All installation steps have been reset");
        }
    }
}
