using UnityEditor;
using UnityEngine;
using UnityEngine.UIElements;
using System.IO;

public abstract class BaseInstallationWindow : EditorWindow
{
    private const string UiPath = "Editor/UI";

    private static void LogDebug(string message, bool verboseOnly = true)
    {
        PackagePathUtility.LogDebug(message, verboseOnly);
    }

    private static string GetAssetPath(string fileName)
    {
        LogDebug($"called for {fileName}", true);
        string packagePath = PackagePathUtility.GetPackagePath();
        
        if (string.IsNullOrEmpty(packagePath))
        {
            LogDebug("returned empty path", false);
            return string.Empty;
        }
        
        if (packagePath.Contains("PackageCache"))
        {
            string projectPath = Path.GetDirectoryName(Application.dataPath);
            string cacheFolder = Path.GetFileName(packagePath);
            string packageName = cacheFolder;
            
            if (cacheFolder.Contains("@"))
            {
                packageName = cacheFolder.Substring(0, cacheFolder.IndexOf('@'));
            }
            
            LogDebug($"Detected package cache. Package name: {packageName}", true);
            string packageRelativePath = $"Packages/{packageName}/{UiPath}/{fileName}";
            LogDebug($"Package-relative path: {packageRelativePath}", true);
            return packageRelativePath;
        }
        else if (packagePath.StartsWith(Application.dataPath))
        {
            string projectPath = Path.GetDirectoryName(Application.dataPath);
            string projectRelativePath = packagePath.Substring(projectPath.Length + 1);
            string assetPath = Path.Combine(projectRelativePath, UiPath, fileName);
            assetPath = assetPath.Replace('\\', '/');
            
            LogDebug($"Assets-relative path: {assetPath}", false);
            return assetPath;
        }
        else
        {
            string projectPath = Path.GetDirectoryName(Application.dataPath);
            string fullPath = Path.Combine(packagePath, UiPath, fileName);
            
            if (fullPath.StartsWith(projectPath))
            {
                string relativePath = fullPath.Substring(projectPath.Length + 1);
                relativePath = relativePath.Replace('\\', '/');
                LogDebug($"Project-relative path: {relativePath}", false);
                return relativePath;
            }
            else
            {
                LogDebug($"Warning: Path is outside project. Full path: {fullPath}", false);
                return fullPath;
            }
        }
    }

    protected static string GetUxmlPath()
    {
        return GetAssetPath("InstallationGuideWindow.uxml");
    }

    protected virtual void CreateGUI()
    {
        LogDebug("called", true);
        
        string uxmlPath = GetUxmlPath();
        LogDebug($"UXML Path: {uxmlPath}", true);
        
        if (string.IsNullOrEmpty(uxmlPath))
        {
            LogDebug("UXML path is empty, cannot load UI", false);
            return;
        }
        
        var visualTree = AssetDatabase.LoadAssetAtPath<VisualTreeAsset>(uxmlPath);
        if (visualTree == null)
        {
            LogDebug($"Could not find UXML at path: {uxmlPath}", false);
            
            if (uxmlPath.StartsWith("Packages/") || uxmlPath.StartsWith("Assets/"))
            {
                LogDebug("Path is in the correct format for AssetDatabase, but asset couldn't be found", false);
            }
            else if (File.Exists(uxmlPath))
            {
                LogDebug($"File exists at {uxmlPath} but AssetDatabase path format is incorrect", false);
                
                var guids = AssetDatabase.FindAssets("InstallationGuideWindow t:VisualTreeAsset");
                if (guids.Length > 0)
                {
                    string path = AssetDatabase.GUIDToAssetPath(guids[0]);
                    LogDebug($"Found UXML via GUID search at: {path}", false);
                    visualTree = AssetDatabase.LoadAssetAtPath<VisualTreeAsset>(path);
                }
                else
                {
                    LogDebug("Could not find UXML via GUID search", false);
                }
            }
            else
            {
                LogDebug($"File does not exist at path: {uxmlPath}", false);
            }
            
            if (visualTree == null)
            {
                AssetDatabase.Refresh();
                visualTree = AssetDatabase.LoadAssetAtPath<VisualTreeAsset>(uxmlPath);
                
                if (visualTree == null)
                {
                    LogDebug("Still could not load UXML after refreshing AssetDatabase", false);
                    return;
                }
            }
        }

        visualTree.CloneTree(rootVisualElement);

        OnUICreated();
    }

    protected abstract void OnUICreated();
}
