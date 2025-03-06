using UnityEngine;
using UnityEditor;
using UnityEditor.PackageManager;
using System.IO;
using System.Linq;
using System;
using System.Text;

namespace Gauntletrunner2025.UgsCliMcp.Editor.Utilities
{
    public static class PackagePathUtility
    {
        private static readonly string PackageName = "ugs-cli-mcp-package";
        private static readonly string AssetsPath = Path.Combine("Assets", "ugs-cli-mcp-package");
        private const string DeveloperModeKey = "MCPDeveloperMode";
        private const string LastResolvedPathKey = "MCPLastResolvedPath";
        
        static PackagePathUtility()
        {
            LogDebug("PackagePathUtility initialized");
        }
        
        private static void LogDebug(string message)
        {
            // Always use LogError for visibility in the console
            Debug.LogError($"[MCP DEBUG] {message}");
        }

        public static string GetPackagePath()
        {
            LogDebug("=== GetPackagePath() CALLED ===");
            
            var isDeveloperMode = EditorPrefs.GetBool(DeveloperModeKey, false);
            LogDebug($"Developer Mode: {isDeveloperMode}");
            
            // Find all possible paths and log them before deciding
            LogDebug("Examining all possible paths:");
            string devModePath = TryGetDeveloperModePath();
            string packageModePath = TryGetPackageModePath();
            string cachePath = FindPackageInPackageCache();
            string lastKnownPath = EditorPrefs.GetString(LastResolvedPathKey, string.Empty);
            
            LogDebug($"Developer Mode Path: '{devModePath}', exists: {!string.IsNullOrEmpty(devModePath) && Directory.Exists(devModePath)}");
            LogDebug($"Package Mode Path: '{packageModePath}', exists: {!string.IsNullOrEmpty(packageModePath) && Directory.Exists(packageModePath)}");
            LogDebug($"Cache Path: '{cachePath}', exists: {!string.IsNullOrEmpty(cachePath) && Directory.Exists(cachePath)}");
            LogDebug($"Last Known Path: '{lastKnownPath}', exists: {!string.IsNullOrEmpty(lastKnownPath) && Directory.Exists(lastKnownPath)}");
            
            // Try to get the path using the appropriate method based on mode
            string resolvedPath = isDeveloperMode ? devModePath : packageModePath;
            
            // If we found a valid path, store it as a fallback for future use
            if (!string.IsNullOrEmpty(resolvedPath) && Directory.Exists(resolvedPath))
            {
                LogDebug($"✓ Using primary path: {resolvedPath}");
                EditorPrefs.SetString(LastResolvedPathKey, resolvedPath);
                return resolvedPath;
            }
            
            // If the appropriate method failed, try the alternative method
            LogDebug("Primary path resolution failed. Trying alternative method.");
            resolvedPath = isDeveloperMode ? packageModePath : devModePath;

            if (!string.IsNullOrEmpty(resolvedPath) && Directory.Exists(resolvedPath))
            {
                LogDebug($"✓ Using alternative path: {resolvedPath}");
                EditorPrefs.SetString(LastResolvedPathKey, resolvedPath);
                return resolvedPath;
            }
            
            // Try package cache path
            if (!string.IsNullOrEmpty(cachePath) && Directory.Exists(cachePath))
            {
                LogDebug($"✓ Using package cache path: {cachePath}");
                EditorPrefs.SetString(LastResolvedPathKey, cachePath);
                return cachePath;
            }
            
            // Last resort: try to use the cached path from a previous successful resolution
            if (!string.IsNullOrEmpty(lastKnownPath) && Directory.Exists(lastKnownPath))
            {
                LogDebug($"✓ Using last known working path: {lastKnownPath}");
                return lastKnownPath;
            }
            
            // If all else fails, dump diagnostic info
            LogDebug("!!! FAILED TO RESOLVE PACKAGE PATH !!!");
            DumpDiagnosticInfo();
            return string.Empty;
        }
        
        private static void DumpDiagnosticInfo()
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("=== MCP DIAGNOSTIC INFO ===");
            sb.AppendLine($"Current Directory: {Directory.GetCurrentDirectory()}");
            sb.AppendLine($"Application.dataPath: {Application.dataPath}");
            sb.AppendLine($"Application.persistentDataPath: {Application.persistentDataPath}");
            
            try
            {
                // List some relevant directories to help diagnose the issue
                string projectPath = Path.GetDirectoryName(Application.dataPath);
                sb.AppendLine($"Project Path: {projectPath}");
                
                string packagesPath = Path.Combine(projectPath, "Packages");
                if (Directory.Exists(packagesPath))
                {
                    sb.AppendLine("Packages directory exists. Contents:");
                    foreach (var dir in Directory.GetFiles(packagesPath))
                    {
                        sb.AppendLine($"  - {Path.GetFileName(dir)}");
                    }
                }
                
                string libPath = Path.Combine(projectPath, "Library");
                string packageCachePath = Path.Combine(libPath, "PackageCache");
                if (Directory.Exists(packageCachePath))
                {
                    sb.AppendLine("Package Cache directory exists. Contents:");
                    foreach (var dir in Directory.GetDirectories(packageCachePath))
                    {
                        sb.AppendLine($"  - {Path.GetFileName(dir)}");
                    }
                }
                
                sb.AppendLine("=== END DIAGNOSTIC INFO ===");
                LogDebug(sb.ToString());
            }
            catch (Exception ex)
            {
                LogDebug($"Error during diagnostics: {ex.Message}");
            }
        }
        
        private static string TryGetDeveloperModePath()
        {
            try
            {
                // In developer mode, use the Assets folder path
                string projectPath = Path.GetDirectoryName(Application.dataPath);
                string fullAssetsPath = Path.GetFullPath(Path.Combine(projectPath, AssetsPath));

                if (Directory.Exists(fullAssetsPath))
                {
                    LogDebug($"Developer mode path resolved: {fullAssetsPath}");
                    return fullAssetsPath;
                }
                else
                {
                    LogDebug($"Developer mode path not found: {fullAssetsPath}");
                }
            }
            catch (Exception ex)
            {
                LogDebug($"Error in TryGetDeveloperModePath: {ex.Message}");
            }
            return string.Empty;
        }
        
        private static string TryGetPackageModePath()
        {
            try
            {
                // Try the standard package manager path first
                var packageInfo = UnityEditor.PackageManager.PackageInfo.FindForAssetPath(Path.Combine("Packages", PackageName));
                if (packageInfo != null && !string.IsNullOrEmpty(packageInfo.resolvedPath))
                {
                    LogDebug($"Package info found: {packageInfo.name} at {packageInfo.resolvedPath}");
                    LogDebug($"Package source: {packageInfo.source}, Version: {packageInfo.version}");
                    
                    if (Directory.Exists(packageInfo.resolvedPath))
                    {
                        return packageInfo.resolvedPath;
                    }
                    else
                    {
                        LogDebug($"Package resolvedPath directory does not exist: {packageInfo.resolvedPath}");
                    }
                }
                else
                {
                    LogDebug("PackageInfo.FindForAssetPath returned null or empty resolvedPath");
                }
                
                // If that fails, try finding the package via package list
                LogDebug("Attempting to find package in package list...");
                var listRequest = UnityEditor.PackageManager.Client.List(true);
                while (!listRequest.IsCompleted)
                {
                    // Wait for the request to complete
                    System.Threading.Thread.Sleep(100);
                }
                
                if (listRequest.Status == UnityEditor.PackageManager.StatusCode.Success)
                {
                    LogDebug($"Package list request succeeded, found {listRequest.Result.Count()} packages.");
                    foreach (var pkg in listRequest.Result)
                    {
                        LogDebug($"Package: {pkg.name}, Path: {pkg.resolvedPath}, Source: {pkg.source}");
                    }
                    
                    var package = listRequest.Result.FirstOrDefault(p => p.name.Contains(PackageName));
                    if (package != null && !string.IsNullOrEmpty(package.resolvedPath))
                    {
                        LogDebug($"Found package via list: {package.resolvedPath}");
                        if (Directory.Exists(package.resolvedPath))
                        {
                            return package.resolvedPath;
                        }
                        else
                        {
                            LogDebug($"Package list resolvedPath directory does not exist: {package.resolvedPath}");
                        }
                    }
                    else
                    {
                        LogDebug($"No package with name containing '{PackageName}' found in package list");
                    }
                }
                else
                {
                    LogDebug($"Package list request failed with status: {listRequest.Status}, Error: {listRequest.Error?.message}");
                }
            }
            catch (Exception ex)
            {
                LogDebug($"Error in TryGetPackageModePath: {ex.Message}, StackTrace: {ex.StackTrace}");
            }
            
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
                    LogDebug($"Package cache directory not found: {packageCachePath}");
                    return string.Empty;
                }
                
                LogDebug($"Scanning package cache at {packageCachePath}");
                
                // Look for directories that might contain our package (including those with hash suffixes)
                var packageDirs = Directory.GetDirectories(packageCachePath)
                                          .Where(dir => Path.GetFileName(dir).StartsWith(PackageName) || 
                                                 Path.GetFileName(dir).Contains(PackageName + "@"))
                                          .ToArray();
                
                LogDebug($"Found {packageDirs.Length} potential package directories in cache");
                foreach (var dir in packageDirs)
                {
                    LogDebug($"Potential cache dir: {dir}");
                }
                
                if (packageDirs.Length > 0)
                {
                    // Sort by creation time to get most recent
                    Array.Sort(packageDirs, (a, b) => Directory.GetCreationTime(b).CompareTo(Directory.GetCreationTime(a)));
                    string mostRecentPackageDir = packageDirs[0];
                    LogDebug($"Selected most recent package in cache: {mostRecentPackageDir}");
                    return mostRecentPackageDir;
                }
            }
            catch (Exception ex)
            {
                LogDebug($"Error in FindPackageInPackageCache: {ex.Message}");
            }
            
            return string.Empty;
        }
    }
}
