using UnityEditor;
using UnityEngine;
using UnityEngine.UIElements;
using System.IO;
using Gauntletrunner2025.UgsCliMcp.Editor.Utilities;

namespace GauntletRunner2025.UgsCliMcp.Editor
{
    public abstract class BaseInstallationWindow : EditorWindow
    {
        private const string DeveloperModeKey = "MCPDeveloperMode";
        private const string PackageName = "ugs-cli-mcp-package";
        private const string UiPath = "Editor/UI";

        private static string GetAssetPath(string fileName)
        {
            var isDeveloperMode = EditorPrefs.GetBool(DeveloperModeKey, false);
            var root = isDeveloperMode ? "Assets" : "Packages";
            return $"{root}/{PackageName}/{UiPath}/{fileName}";
        }

        protected static string GetUxmlPath()
        {
            return GetAssetPath("InstallationGuideWindow.uxml");
        }

        protected static string GetUssPath()
        {
            return GetAssetPath("InstallationGuideWindow.uss");
        }

        protected virtual void CreateGUI()
        {
            // Import UXML
            var visualTree = AssetDatabase.LoadAssetAtPath<VisualTreeAsset>(GetUxmlPath());
            if (visualTree == null)
            {
                Debug.LogError($"Could not find {GetUxmlPath()}");
                return;
            }

            visualTree.CloneTree(rootVisualElement);

            // Import USS
            var styleSheet = AssetDatabase.LoadAssetAtPath<StyleSheet>(GetUssPath());
            if (styleSheet != null)
            {
                rootVisualElement.styleSheets.Add(styleSheet);
            }

            OnUICreated();
        }

        protected abstract void OnUICreated();
    }
}
