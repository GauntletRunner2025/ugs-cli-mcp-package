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
            
            // Determine if the path is in a package cache with a hash
            if (packagePath.Contains("PackageCache"))
            {
                // For package cache paths, we need to convert to a package: path format that Unity understands
                string projectPath = Path.GetDirectoryName(Application.dataPath);
                
                // Extract the package name from the cache folder name (potentially with @hash)
                string cacheFolder = Path.GetFileName(packagePath);
                string packageName = cacheFolder;
                
                // If it has a hash (contains @), extract just the package name part
                if (cacheFolder.Contains("@"))
                {
                    packageName = cacheFolder.Substring(0, cacheFolder.IndexOf('@'));
                }
                
                Debug.LogError($"[MCP DEBUG] Detected package cache. Package name: {packageName}");
                
                // Create a package: relative path which Unity's AssetDatabase can understand
                string packageRelativePath = $"Packages/{packageName}/{UiPath}/{fileName}";
                Debug.LogError($"[MCP DEBUG] Package-relative path: {packageRelativePath}");
                return packageRelativePath;
            }
            else if (packagePath.StartsWith(Application.dataPath))
            {
                // If it's in the Assets folder, make it project-relative
                string projectPath = Path.GetDirectoryName(Application.dataPath);
                string projectRelativePath = packagePath.Substring(projectPath.Length + 1);
                string assetPath = Path.Combine(projectRelativePath, UiPath, fileName);
                
                // Replace backslashes with forward slashes (Unity preference)
                assetPath = assetPath.Replace('\\', '/');
                
                Debug.LogError($"[MCP DEBUG] Assets-relative path: {assetPath}");
                return assetPath;
            }
            else
            {
                // For absolute paths, try to make them relative to the project
                string projectPath = Path.GetDirectoryName(Application.dataPath);
                
                // Try to construct project-relative path
                string fullPath = Path.Combine(packagePath, UiPath, fileName);
                
                if (fullPath.StartsWith(projectPath))
                {
                    string relativePath = fullPath.Substring(projectPath.Length + 1);
                    // Replace backslashes with forward slashes (Unity preference)
                    relativePath = relativePath.Replace('\\', '/');
                    Debug.LogError($"[MCP DEBUG] Project-relative path: {relativePath}");
                    return relativePath;
                }
                else
                {
                    // If it's outside the project, we'll try a direct approach by checking if the file exists
                    // This should generally be avoided but might help during debugging
                    Debug.LogError($"[MCP DEBUG] Warning: Path is outside project. Full path: {fullPath}");
                    return fullPath;
                }
            }
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
                
                // Check if this is a path issue by checking if the file physically exists
                if (uxmlPath.StartsWith("Packages/") || uxmlPath.StartsWith("Assets/"))
                {
                    // The path looks correct for AssetDatabase, file might not exist
                    Debug.LogError($"[MCP DEBUG] Path is in the correct format for AssetDatabase, but asset couldn't be found");
                }
                else if (File.Exists(uxmlPath))
                {
                    Debug.LogError($"[MCP DEBUG] File exists at {uxmlPath} but AssetDatabase path format is incorrect");
                    
                    // Attempt to find the package in the asset database
                    var guids = AssetDatabase.FindAssets("InstallationGuideWindow t:VisualTreeAsset");
                    if (guids.Length > 0)
                    {
                        string path = AssetDatabase.GUIDToAssetPath(guids[0]);
                        Debug.LogError($"[MCP DEBUG] Found UXML via GUID search at: {path}");
                        visualTree = AssetDatabase.LoadAssetAtPath<VisualTreeAsset>(path);
                    }
                    else
                    {
                        Debug.LogError("[MCP DEBUG] Could not find UXML via GUID search");
                    }
                }
                else
                {
                    Debug.LogError($"[MCP DEBUG] File does not exist at path: {uxmlPath}");
                }
                
                if (visualTree == null)
                {
                    // Try refreshing the asset database
                    AssetDatabase.Refresh();
                    visualTree = AssetDatabase.LoadAssetAtPath<VisualTreeAsset>(uxmlPath);
                    
                    if (visualTree == null)
                    {
                        Debug.LogError("[MCP DEBUG] Still could not load UXML after refreshing AssetDatabase");
                        return;
                    }
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
