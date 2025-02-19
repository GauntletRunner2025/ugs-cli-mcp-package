using UnityEngine;
using UnityEditor;

namespace Gauntletrunner2025.UgsCliMcp.Editor.Commands
{
    public static class WelcomeMessageCommand
    {
        private const string WelcomeMessageShownKey = "UgsCliMcp_WelcomeMessageShown";

        [InitializeOnLoadMethod]
        private static void Initialize()
        {
            if (!EditorPrefs.HasKey(WelcomeMessageShownKey))
            {
                Debug.Log("Welcome to UGS CLI MCP! This message will only show once.");
                EditorPrefs.SetBool(WelcomeMessageShownKey, true);
            }
        }

        internal static string WelcomeMessageKey => WelcomeMessageShownKey;
    }
}
