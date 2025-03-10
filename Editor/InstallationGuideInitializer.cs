using UnityEditor;
using UnityEngine;

    public static class InstallationGuideInitializer
    {
        private const float WindowWidth = 620;
        private const float WindowHeight = 380;

        [InitializeOnLoadMethod]
        private static void OnPackageLoaded()
        {
            if (!EditorPrefs.GetBool(MenuCommands.InstallationWindowShownKey, false))
            {
                EditorApplication.delayCall += () =>
                {
                    ShowWindow();
                    EditorPrefs.SetBool(MenuCommands.InstallationWindowShownKey, true);
                };
            }
        }

        [MenuItem("Window/UGS CLI MCP/Installation Guide")]
        [MenuItem("Tools/UGS CLI MCP/Installation")]
        public static void ShowWindow()
        {
            var window = EditorWindow.GetWindow<InstallationGuideWindow>(
                utility: true,
                title: "Installation Guide",
                focus: true
            );

            window.titleContent = new GUIContent("");
            window.minSize = new Vector2(WindowWidth, WindowHeight);
            window.maxSize = window.minSize;
        }
    }