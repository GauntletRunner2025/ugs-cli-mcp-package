using UnityEngine;
using UnityEditor;
using UnityEditor.PackageManager;
using System.IO;
using System.Linq;
using System;
using System.Text;

public static class PackagePathUtility
{
    // Package may be referenced by either of these names
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
            // Get project root directory
            string projectPath = Path.GetDirectoryName(Application.dataPath);
            return Path.Combine(projectPath, "mcp_debug.log");
        }
    }
    
    static PackagePathUtility()
    {
        // Clear out the log file on initialization
        if (File.Exists(LogFilePath))
        {
            File.Delete(LogFilePath);
        }
        
        // Create a header in the log file
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
        
        LogDebug("PackagePathUtility initialized", false);
    }
    
    /// <summary>
    /// Menu item to toggle verbose logging on/off
    /// </summary>
    [MenuItem("Tools/UGS CLI MCP/Toggle Verbose Logging")]
    private static void ToggleVerboseLogging()
    {
        VerboseLogging = !VerboseLogging;
        Debug.Log($"[MCP] Verbose logging is now {(VerboseLogging ? "enabled" : "disabled")}");
    }
    
    /// <summary>
    /// Menu item validation that shows a checkmark when verbose logging is enabled
    /// </summary>
    [MenuItem("Tools/UGS CLI MCP/Toggle Verbose Logging", true)]
    private static bool ToggleVerboseLoggingValidate()
    {
        Menu.SetChecked("Tools/UGS CLI MCP/Toggle Verbose Logging", VerboseLogging);
        return true;
    }
    
    /// <summary>
    /// Gets or sets whether verbose logging is enabled
    /// </summary>
    public static bool VerboseLogging
    {
        get => EditorPrefs.GetBool(VerboseModeKey, false);
        set => EditorPrefs.SetBool(VerboseModeKey, value);
    }
    
    public static void LogDebug(string message, bool verboseOnly = true)
    {
        // Only log if this is not a verbose-only message, or if verbose mode is on
        if (!verboseOnly || VerboseLogging)
        {
            string prefix = verboseOnly ? "[MCP DEBUG]" : "[MCP]";
            string logMessage = $"{prefix} {message}";
            Debug.Log(logMessage);
            
            // Also write to file with calling method name
            try 
            {
                var frame = new StackFrame(1, true);
                string fileName = Path.GetFileName(frame.GetFileName() ?? "Unknown");
                int lineNumber = frame.GetFileLineNumber();
                string methodName = frame.GetMethod()?.Name ?? "Unknown";
                
                string fileMessage = $"({fileName}:{lineNumber} in {methodName}) {logMessage}\n";
                File.AppendAllText(LogFilePath, fileMessage);
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to write to log file at {LogFilePath}: {ex.Message}");
            }
        }
    }

    public static string GetPackagePath()
    {
        LogDebug("=== GetPackagePath() CALLED ===");
        
        var isDeveloperMode = EditorPrefs.GetBool(DeveloperModeKey, false);
        LogDebug($"Developer Mode: {isDeveloperMode}", false);  // Always log mode for troubleshooting
        
        // Find all possible paths
        string devModePath = TryGetDeveloperModePath();
        string packageModePath = TryGetPackageModePath();
        string cachePath = FindPackageInPackageCache();
        string lastKnownPath = EditorPrefs.GetString(LastResolvedPathKey, string.Empty);
        
        // Only log paths in verbose mode
        if (VerboseLogging)
        {
            LogDebug($"Developer Mode Path: '{devModePath}', exists: {!string.IsNullOrEmpty(devModePath) && Directory.Exists(devModePath)}");
            LogDebug($"Package Mode Path: '{packageModePath}', exists: {!string.IsNullOrEmpty(packageModePath) && Directory.Exists(packageModePath)}");
            LogDebug($"Cache Path: '{cachePath}', exists: {!string.IsNullOrEmpty(cachePath) && Directory.Exists(cachePath)}");
            LogDebug($"Last Known Path: '{lastKnownPath}', exists: {!string.IsNullOrEmpty(lastKnownPath) && Directory.Exists(lastKnownPath)}");
        }
        
        // Try to get the path using the appropriate method based on mode
        string resolvedPath = isDeveloperMode ? devModePath : packageModePath;
        
        // If we found a valid path, store it as a fallback for future use
        if (!string.IsNullOrEmpty(resolvedPath) && Directory.Exists(resolvedPath))
        {
            LogDebug($"Using path: {resolvedPath}", false);
            EditorPrefs.SetString(LastResolvedPathKey, resolvedPath);
            return resolvedPath;
        }
        
        // If the appropriate method failed, try the alternative method
        resolvedPath = isDeveloperMode ? packageModePath : devModePath;

        if (!string.IsNullOrEmpty(resolvedPath) && Directory.Exists(resolvedPath))
        {
            LogDebug($"Using alternative path: {resolvedPath}", false);
            EditorPrefs.SetString(LastResolvedPathKey, resolvedPath);
            return resolvedPath;
        }
        
        // Try package cache path
        if (!string.IsNullOrEmpty(cachePath) && Directory.Exists(cachePath))
        {
            LogDebug($"Using package cache path: {cachePath}", false);
            EditorPrefs.SetString(LastResolvedPathKey, cachePath);
            return cachePath;
        }
        
        // Last resort: try to use the cached path from a previous successful resolution
        if (!string.IsNullOrEmpty(lastKnownPath) && Directory.Exists(lastKnownPath))
        {
            LogDebug($"Using last known working path: {lastKnownPath}", false);
            return lastKnownPath;
        }
        
        // If all else fails, dump diagnostic info
        LogDebug("Failed to resolve package path - no valid paths found", false);
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
            // Always log diagnostic info when something fails
            LogDebug(sb.ToString(), false);
        }
        catch (Exception ex)
        {
            LogDebug($"Error during diagnostics: {ex.Message}", false);
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
            LogDebug($"Error in TryGetDeveloperModePath: {ex.Message}", false);
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
                LogDebug($"Trying to find package with name: {packageName}");
                
                // Try the standard package manager path first
                var packageInfo = UnityEditor.PackageManager.PackageInfo.FindForAssetPath(Path.Combine("Packages", packageName));
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
                    LogDebug($"PackageInfo.FindForAssetPath returned null or empty resolvedPath for {packageName}");
                }
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
                    
                    // Check if this package matches any of our known names
                    foreach (string packageName in PackageNames)
                    {
                        if (pkg.name.Contains(packageName))
                        {
                            if (!string.IsNullOrEmpty(pkg.resolvedPath) && Directory.Exists(pkg.resolvedPath))
                            {
                                LogDebug($"Found matching package via list: {pkg.name} at {pkg.resolvedPath}", false);
                                return pkg.resolvedPath;
                            }
                            else
                            {
                                LogDebug($"Package list resolvedPath directory does not exist: {pkg.resolvedPath}");
                            }
                        }
                    }
                }
                
                LogDebug($"No package matching any of the known names found in package list");
            }
            else
            {
                LogDebug($"Package list request failed with status: {listRequest.Status}, Error: {listRequest.Error?.message}", false);
            }
        }
        catch (Exception ex)
        {
            LogDebug($"Error in TryGetPackageModePath: {ex.Message}, StackTrace: {ex.StackTrace}", false);
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
                LogDebug($"Package cache directory not found: {packageCachePath}", false);
                return string.Empty;
            }
            
            LogDebug($"Scanning package cache at {packageCachePath}");
            
            // Get all directories in the package cache
            var allDirs = Directory.GetDirectories(packageCachePath);
            LogDebug($"Found {allDirs.Length} total directories in package cache");
            
            // Look for directories that might contain our package (including those with hash suffixes)
            var packageDirs = new System.Collections.Generic.List<string>();
            
            foreach (string dir in allDirs)
            {
                string dirName = Path.GetFileName(dir);
                foreach (string packageName in PackageNames)
                {
                    if (dirName.StartsWith(packageName) || dirName.Contains(packageName + "@"))
                    {
                        LogDebug($"Potential cache dir for '{packageName}': {dir}");
                        packageDirs.Add(dir);
                        break;
                    }
                }
            }
            
            LogDebug($"Found {packageDirs.Count} potential package directories in cache");
            
            if (packageDirs.Count > 0)
            {
                // Sort by creation time to get most recent
                packageDirs.Sort((a, b) => Directory.GetCreationTime(b).CompareTo(Directory.GetCreationTime(a)));
                string mostRecentPackageDir = packageDirs[0];
                LogDebug($"Selected most recent package in cache: {mostRecentPackageDir}", false);
                return mostRecentPackageDir;
            }
        }
        catch (Exception ex)
        {
            LogDebug($"Error in FindPackageInPackageCache: {ex.Message}", false);
        }
        
        return string.Empty;
    }
}
