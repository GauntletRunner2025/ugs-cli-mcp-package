using UnityEngine;
using UnityEditor;
using UnityEditor.PackageManager;
using System.IO;
using System.Linq;
using System;
using System.Text;
using System.Diagnostics;
using Debug = UnityEngine.Debug;

public static class PackagePathUtility
{
    private static readonly string[] PackageNames = new string[] {
        "ugs-cli-mcp-package", 
        "ugs-cli-mcp-core",
        "com.gauntletrunner2025.ugs-cli-mcp-core"
    };
    private static readonly string AssetsPath = Path.Combine("Assets", "ugs-cli-mcp-package");
    private const string DeveloperModeKey = "MCPDeveloperMode";
    private const string LastResolvedPathKey = "MCPLastResolvedPath";
    private const string VerboseModeKey = "MCPVerboseLogging";
    private static string LogFilePath 
    {
        get 
        {
            string projectPath = Path.GetDirectoryName(Application.dataPath);
            return Path.Combine(projectPath, "mcp_debug.log");
        }
    }

    private static string cachedPackagePath;
    private static bool isPackagePathCached;
    private static bool wasDeveloperMode;
    
    static PackagePathUtility()
    {
        if (File.Exists(LogFilePath))
        {
            File.Delete(LogFilePath);
        }
        
        try
        {
            string header = $"=== MCP Debug Log ===\n" +
                          $"Project Path: {Path.GetDirectoryName(Application.dataPath)}\n" +
                          $"Package Cache: {Path.Combine(Path.GetDirectoryName(Application.dataPath), "Library", "PackageCache")}\n" +
                          $"Developer Mode: {EditorPrefs.GetBool(DeveloperModeKey, false)}\n" +
                          $"Verbose Logging: {VerboseLogging}\n" +
                          $"Unity Version: {Application.unityVersion}\n" +
                          "==================\n\n";
            File.WriteAllText(LogFilePath, header);
        }
        catch (Exception ex)
        {
            Debug.LogError($"Failed to create log file header: {ex.Message}");
        }
        
        LogDebug("initialized", false);
        wasDeveloperMode = EditorPrefs.GetBool(DeveloperModeKey, false);
    }

    public static string GetPackagePath()
    {
        bool currentDeveloperMode = EditorPrefs.GetBool(DeveloperModeKey, false);
        
        if (currentDeveloperMode != wasDeveloperMode)
        {
            LogDebug($"mode changed from {wasDeveloperMode} to {currentDeveloperMode}, clearing cache", true);
            ClearPackagePathCache();
            wasDeveloperMode = currentDeveloperMode;
        }

        if (isPackagePathCached && !string.IsNullOrEmpty(cachedPackagePath))
        {
            if (Directory.Exists(cachedPackagePath))
            {
                LogDebug("using cached path", true);
                return cachedPackagePath;
            }
            else
            {
                LogDebug("cached path no longer exists, clearing cache", true);
                ClearPackagePathCache();
            }
        }

        LogDebug($"developer mode: {DeveloperMode}", false);

        string path = null;

        // Try developer mode path first
        if (DeveloperMode)
        {
            path = TryGetDeveloperModePath();
        }

        // Try package mode path next
        if (string.IsNullOrEmpty(path))
        {
            path = TryGetPackageModePath();
        }

        if (!string.IsNullOrEmpty(path))
        {
            LogDebug($"using path: {path}", false);
            EditorPrefs.SetString(LastResolvedPathKey, path);
            cachedPackagePath = path;
            isPackagePathCached = true;
            return path;
        }

        throw new Exception("Failed to resolve package path. Please ensure the package is properly installed.");
    }

    private static string TryGetDeveloperModePath()
    {
        try
        {
            string fullAssetsPath = Path.GetFullPath(AssetsPath);
            LogDebug($"checking developer mode path: {fullAssetsPath}");

            if (Directory.Exists(fullAssetsPath))
            {
                LogDebug($"developer mode path resolved: {fullAssetsPath}");
                return fullAssetsPath;
            }
            else
            {
                LogDebug($"developer mode path not found: {fullAssetsPath}");
            }
        }
        catch (Exception ex)
        {
            LogDebug($"Error checking developer mode path: {ex.Message}");
        }
        return string.Empty;
    }

    private static string TryGetPackageModePath()
    {
        try
        {
            // Try each package name variant
            foreach (string packageName in PackageNames)
            {
                LogDebug($"trying to find package with name: {packageName}");
                
                // Try the standard package manager path first
                var packageInfo = UnityEditor.PackageManager.PackageInfo.FindForAssetPath(Path.Combine("Packages", packageName));
                if (packageInfo != null)
                {
                    LogDebug($"package info found: {packageInfo.name} at {packageInfo.resolvedPath}");
                    LogDebug($"package source: {packageInfo.source}, Version: {packageInfo.version}");
                    
                    if (Directory.Exists(packageInfo.resolvedPath))
                    {
                        return packageInfo.resolvedPath;
                    }
                    else
                    {
                        LogDebug($"package resolvedPath directory does not exist: {packageInfo.resolvedPath}");
                    }
                }
            }
            
            // If that fails, try finding the package via package list
            LogDebug("attempting to find package in package list...");
            var listRequest = UnityEditor.PackageManager.Client.List(true);
            while (!listRequest.IsCompleted)
            {
                System.Threading.Thread.Sleep(100);
            }
            
            if (listRequest.Status == UnityEditor.PackageManager.StatusCode.Success)
            {
                LogDebug($"package list request succeeded, found {listRequest.Result.Count()} packages.");
                foreach (var pkg in listRequest.Result)
                {
                    LogDebug($"package: {pkg.name}, Path: {pkg.resolvedPath}, Source: {pkg.source}");
                    
                    // Check if this package matches any of our known names
                    foreach (string packageName in PackageNames)
                    {
                        if (pkg.name == packageName)
                        {
                            if (!string.IsNullOrEmpty(pkg.resolvedPath) && Directory.Exists(pkg.resolvedPath))
                            {
                                LogDebug($"found matching package via list: {pkg.name} at {pkg.resolvedPath}", false);
                                return pkg.resolvedPath;
                            }
                            else
                            {
                                LogDebug($"package list resolvedPath directory does not exist: {pkg.resolvedPath}");
                            }
                        }
                    }
                }
                
                LogDebug($"no package matching any of the known names found in package list");
            }
            else
            {
                LogDebug($"package list request failed with status: {listRequest.Status}, Error: {listRequest.Error?.message}", false);
            }
        }
        catch (Exception ex)
        {
            LogDebug($"Error in TryGetPackageModePath: {ex.Message}");
        }
        return string.Empty;
    }

    public static void ClearPackagePathCache()
    {
        LogDebug("clearing cache", true);
        cachedPackagePath = null;
        isPackagePathCached = false;
    }
}
