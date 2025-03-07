using UnityEngine;
using UnityEditor;
using System.Diagnostics;
using Debug = UnityEngine.Debug;

public static class MenuCommands
{
    private const string WelcomeMessageShownKey = "UgsCliMcp_WelcomeMessageShown";
    private const string EnvironmentNameKey = "UgsCliMcp_EnvironmentName";
    internal const string InstallationWindowShownKey = "GauntletRunner2025_UgsCliMcp_HasShownInstallationWindow";
    private const string ShowStackTracesKey = "UgsCliMcp_ShowStackTraces";
    private const string ServiceRoleInstructionsLink = @"https://docs.unity.com/ugs/en-us/manual/game-server-hosting/manual/concepts/authentication-service-accounts";
    private const string LoginInstructions = @"echo Welcome to UGS CLI MCP Login! && echo. && " +
        @"echo Go to " + ServiceRoleInstructionsLink + " && " +
        @"echo Follow their instructions to create a service role account and key. && " +
        @"echo You will need the key id and secret to use with the ugs-cli tool. && " +
        @"ugs login";

    [InitializeOnLoadMethod]
    private static void Initialize()
    {
        // Set stack trace visibility based on saved preference
        UpdateStackTraceVisibility();
        
        if (!EditorPrefs.HasKey(WelcomeMessageShownKey))
        {
            UnityEngine.Debug.Log("Welcome to UGS CLI MCP! This message will only show once.");
            EditorPrefs.SetBool(WelcomeMessageShownKey, true);
        }
    }

    [MenuItem("Tools/UGS CLI MCP/Toggle Stack Traces")]
    private static void ToggleStackTraces()
    {
        bool showStackTraces = !EditorPrefs.GetBool(ShowStackTracesKey, false);
        EditorPrefs.SetBool(ShowStackTracesKey, showStackTraces);
        UpdateStackTraceVisibility();
        Debug.Log($"[MCP] Stack traces are now {(showStackTraces ? "enabled" : "disabled")}");
    }

    [MenuItem("Tools/UGS CLI MCP/Toggle Stack Traces", true)]
    private static bool ValidateToggleStackTraces()
    {
        bool showStackTraces = EditorPrefs.GetBool(ShowStackTracesKey, false);
        Menu.SetChecked("Tools/UGS CLI MCP/Toggle Stack Traces", showStackTraces);
        return true;
    }

    private static void UpdateStackTraceVisibility()
    {
        bool showStackTraces = EditorPrefs.GetBool(ShowStackTracesKey, false);
        Application.SetStackTraceLogType(LogType.Log, 
            showStackTraces ? StackTraceLogType.ScriptOnly : StackTraceLogType.None);
    }

    internal static string WelcomeMessageKey => WelcomeMessageShownKey;
    internal static string GetEnvironmentName() => EditorPrefs.GetString(EnvironmentNameKey, "production");
    internal static string GetProjectId() => CloudProjectSettings.projectId;
}