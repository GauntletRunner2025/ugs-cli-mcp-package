using UnityEditor;
using UnityEngine;
using UnityEngine.UIElements;
using System.IO;
using Gauntletrunner2025.UgsCliMcp.Editor.Utilities;

namespace GauntletRunner2025.UgsCliMcp.Editor
{
    public abstract class BaseInstallationWindow : EditorWindow
    {
        private const string UiPath = "Editor/UI";

        private static string GetAssetPath(string fileName)
        {
            // Use the enhanced PackagePathUtility to determine the correct package path
            Debug.LogError($"[MCP DEBUG] BaseInstallationWindow.GetAssetPath called for {fileName}");
            string packagePath = PackagePathUtility.GetPackagePath();
            
            if (string.IsNullOrEmpty(packagePath))
            {
                Debug.LogError($"[MCP DEBUG] PackagePathUtility.GetPackagePath returned empty path");
                return string.Empty;
            }
            
            string fullPath = Path.Combine(packagePath, UiPath, fileName);
            Debug.LogError($"[MCP DEBUG] Full asset path: {fullPath}");
            
            return fullPath;
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
            Debug.LogError("[MCP DEBUG] BaseInstallationWindow.CreateGUI called");
            
            // Get UXML path
            string uxmlPath = GetUxmlPath();
            Debug.LogError($"[MCP DEBUG] UXML Path: {uxmlPath}");
            
            if (string.IsNullOrEmpty(uxmlPath))
            {
                Debug.LogError("[MCP DEBUG] UXML path is empty, cannot load UI");
                return;
            }
            
            // Import UXML
            var visualTree = AssetDatabase.LoadAssetAtPath<VisualTreeAsset>(uxmlPath);
            if (visualTree == null)
            {
                Debug.LogError($"[MCP DEBUG] Could not find UXML at path: {uxmlPath}");
                
                // Try alternative approach to load the asset directly
                if (File.Exists(uxmlPath))
                {
                    Debug.LogError($"[MCP DEBUG] File exists at {uxmlPath} but AssetDatabase could not load it");
                    
                    // Try refreshing the asset database
                    AssetDatabase.Refresh();
                    visualTree = AssetDatabase.LoadAssetAtPath<VisualTreeAsset>(uxmlPath);
                    
                    if (visualTree == null)
                    {
                        Debug.LogError("[MCP DEBUG] Still could not load UXML after refreshing AssetDatabase");
                        return;
                    }
                }
                else
                {
                    Debug.LogError($"[MCP DEBUG] File does not exist at path: {uxmlPath}");
                    return;
                }
            }

            visualTree.CloneTree(rootVisualElement);

            // Get USS path
            string ussPath = GetUssPath();
            Debug.LogError($"[MCP DEBUG] USS Path: {ussPath}");
            
            // Import USS
            var styleSheet = AssetDatabase.LoadAssetAtPath<StyleSheet>(ussPath);
            if (styleSheet != null)
            {
                rootVisualElement.styleSheets.Add(styleSheet);
            }
            else
            {
                Debug.LogError($"[MCP DEBUG] Could not find USS at path: {ussPath}");
            }

            OnUICreated();
        }

        protected abstract void OnUICreated();
    }
}
