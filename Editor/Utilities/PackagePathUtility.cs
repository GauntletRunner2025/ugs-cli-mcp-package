using UnityEngine;
using UnityEditor;
using UnityEditor.PackageManager;
using System.IO;
using System.Linq;
using System;

namespace Gauntletrunner2025.UgsCliMcp.Editor.Utilities
{
    public static class PackagePathUtility
    {
        private static readonly string PackageName = "ugs-cli-mcp-package";
        private static readonly string AssetsPath = Path.Combine("Assets", "ugs-cli-mcp-package");
        private const string DeveloperModeKey = "MCPDeveloperMode";
        private const string LastResolvedPathKey = "MCPLastResolvedPath";

        public static string GetPackagePath()
        {
            var isDeveloperMode = EditorPrefs.GetBool(DeveloperModeKey, false);
            Debug.Log($"[MCP] GetPackagePath - Developer Mode: {isDeveloperMode}");
            
            // Try to get the path using the appropriate method based on mode
            string resolvedPath = isDeveloperMode ? 
                                  TryGetDeveloperModePath() : 
                                  TryGetPackageModePath();
            
            // If we found a valid path, store it as a fallback for future use
            if (!string.IsNullOrEmpty(resolvedPath) && Directory.Exists(resolvedPath))
            {
                EditorPrefs.SetString(LastResolvedPathKey, resolvedPath);
                return resolvedPath;
            }
            
            // If the appropriate method failed, try the alternative method
            Debug.LogWarning($"[MCP] Primary path resolution method failed. Trying alternative method.");
            resolvedPath = isDeveloperMode ? 
                          TryGetPackageModePath() : 
                          TryGetDeveloperModePath();

            if (!string.IsNullOrEmpty(resolvedPath) && Directory.Exists(resolvedPath))
            {
                Debug.Log($"[MCP] Alternative path resolution succeeded: {resolvedPath}");
                return resolvedPath;
            }
            
            // Last resort: try to use the cached path from a previous successful resolution
            string lastKnownPath = EditorPrefs.GetString(LastResolvedPathKey, string.Empty);
            if (!string.IsNullOrEmpty(lastKnownPath) && Directory.Exists(lastKnownPath))
            {
                Debug.LogWarning($"[MCP] Using last known working path: {lastKnownPath}");
                return lastKnownPath;
            }
            
            // If all else fails, try a deep search for the package in the package cache
            resolvedPath = FindPackageInPackageCache();
            if (!string.IsNullOrEmpty(resolvedPath))
            {
                Debug.Log($"[MCP] Found package in cache: {resolvedPath}");
                return resolvedPath;
            }
            
            Debug.LogError($"[MCP] Failed to resolve package path through all available methods.");
            return string.Empty;
        }
        
        private static string TryGetDeveloperModePath()
        {
            // In developer mode, use the Assets folder path
            string projectPath = Path.GetDirectoryName(Application.dataPath);
            string fullAssetsPath = Path.GetFullPath(Path.Combine(projectPath, AssetsPath));

            if (Directory.Exists(fullAssetsPath))
            {
                Debug.Log($"[MCP] Developer mode path resolved: {fullAssetsPath}");
                return fullAssetsPath;
            }
            else
            {
                Debug.LogError($"[MCP] Developer mode path not found: {fullAssetsPath}");
                return string.Empty;
            }
        }
        
        private static string TryGetPackageModePath()
        {
            // Try the standard package manager path first
            var packageInfo = UnityEditor.PackageManager.PackageInfo.FindForAssetPath(Path.Combine("Packages", PackageName));
            if (packageInfo != null && !string.IsNullOrEmpty(packageInfo.resolvedPath) && Directory.Exists(packageInfo.resolvedPath))
            {
                Debug.Log($"[MCP] Package mode path resolved: {packageInfo.resolvedPath}");
                Debug.Log($"[MCP] Package source: {packageInfo.source}, Version: {packageInfo.version}");
                return packageInfo.resolvedPath;
            }
            
            // If that fails, try finding the package via package list
            try
            {
                Debug.Log("[MCP] Attempting to find package in package list...");
                var listRequest = UnityEditor.PackageManager.Client.List(true);
                while (!listRequest.IsCompleted)
                {
                    // Wait for the request to complete
                    System.Threading.Thread.Sleep(100);
                }
                
                var package = listRequest.Result.FirstOrDefault(p => p.name.Contains(PackageName));
                if (package != null && !string.IsNullOrEmpty(package.resolvedPath) && Directory.Exists(package.resolvedPath))
                {
                    Debug.Log($"[MCP] Found package via list: {package.resolvedPath}");
                    Debug.Log($"[MCP] Package source: {package.source}, Version: {package.version}");
                    return package.resolvedPath;
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"[MCP] Error finding package in list: {ex.Message}");
            }
            
            Debug.LogError($"[MCP] Package mode path not found for: {PackageName}");
            return string.Empty;
        }
        
        private static string FindPackageInPackageCache()
        {
            try
            {
                // Look for the package in the Unity package cache, which is typically in the Library folder
                string projectPath = Path.GetDirectoryName(Application.dataPath);
                string packageCachePath = Path.Combine(projectPath, "Library", "PackageCache");
                
                if (!Directory.Exists(packageCachePath))
                {
                    Debug.LogError($"[MCP] Package cache directory not found: {packageCachePath}");
                    return string.Empty;
                }
                
                Debug.Log($"[MCP] Scanning package cache for {PackageName} at {packageCachePath}");
                
                // Look for directories that might contain our package (including those with hash suffixes)
                var packageDirs = Directory.GetDirectories(packageCachePath)
                                          .Where(dir => Path.GetFileName(dir).StartsWith(PackageName) || 
                                                 Path.GetFileName(dir).Contains(PackageName + "@"))
                                          .ToArray();
                
                if (packageDirs.Length > 0)
                {
                    // Sort by creation time to get most recent
                    Array.Sort(packageDirs, (a, b) => Directory.GetCreationTime(b).CompareTo(Directory.GetCreationTime(a)));
                    string mostRecentPackageDir = packageDirs[0];
                    Debug.Log($"[MCP] Found package in cache: {mostRecentPackageDir}");
                    return mostRecentPackageDir;
                }
                
                Debug.LogError($"[MCP] Package not found in cache: {PackageName}");
            }
            catch (Exception ex)
            {
                Debug.LogError($"[MCP] Error searching package cache: {ex.Message}");
            }
            
            return string.Empty;
        }
    }
}
