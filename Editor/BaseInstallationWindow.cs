using UnityEditor;
using UnityEngine;
using UnityEngine.UIElements;

namespace GauntletRunner2025.UgsCliMcp.Editor
{
    public abstract class BaseInstallationWindow : EditorWindow
    {
        protected const string UxmlPath = "Assets/ugs-cli-mcp-package/Editor/UI/InstallationGuideWindow.uxml";
        protected const string UssPath = "Assets/ugs-cli-mcp-package/Editor/UI/InstallationGuideWindow.uss";

        protected virtual void CreateGUI()
        {
            // Import UXML
            var visualTree = AssetDatabase.LoadAssetAtPath<VisualTreeAsset>(UxmlPath);
            if (visualTree == null)
            {
                Debug.LogError($"Could not find {UxmlPath}");
                return;
            }

            visualTree.CloneTree(rootVisualElement);

            // Import USS
            var styleSheet = AssetDatabase.LoadAssetAtPath<StyleSheet>(UssPath);
            if (styleSheet != null)
            {
                rootVisualElement.styleSheets.Add(styleSheet);
            }

            OnUICreated();
        }

        protected abstract void OnUICreated();
    }
}
