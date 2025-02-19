using UnityEngine;
using UnityEditor;

namespace Gauntletrunner2025.UgsCliMcp.Editor.Settings
{
    public static class UgsCliMcpSettings
    {
        private const string DeveloperModeKey = "UgsCliMcp_DeveloperMode";

        [MenuItem("Tools/UGS CLI MCP/Settings/Toggle Developer Mode")]
        private static void ToggleDeveloperMode()
        {
            bool currentMode = IsDeveloperMode();
            EditorPrefs.SetBool(DeveloperModeKey, !currentMode);
            Debug.Log($"UGS CLI MCP Developer Mode: {!currentMode}");
        }

        public static bool IsDeveloperMode()
        {
            return EditorPrefs.GetBool(DeveloperModeKey, false);
        }
    }
}
