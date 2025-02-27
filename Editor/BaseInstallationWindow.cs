using UnityEditor;
using UnityEngine;
using UnityEngine.UIElements;
using System.IO;
using Gauntletrunner2025.UgsCliMcp.Editor.Utilities;

namespace GauntletRunner2025.UgsCliMcp.Editor
{
    public abstract class BaseInstallationWindow : EditorWindow
    {
        protected static string GetUxmlPath()
        {
            return "Assets/ugs-cli-mcp-package/Editor/UI/InstallationGuideWindow.uxml";
        }

        protected static string GetUssPath()
        {
            return "Assets/ugs-cli-mcp-package/Editor/UI/InstallationGuideWindow.uss";
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
