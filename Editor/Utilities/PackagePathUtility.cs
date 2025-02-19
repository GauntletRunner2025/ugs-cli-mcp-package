using UnityEngine;
using UnityEditor;
using UnityEditor.PackageManager;
using System.IO;
using Gauntletrunner2025.UgsCliMcp.Editor.Settings;

namespace Gauntletrunner2025.UgsCliMcp.Editor.Utilities
{
    public static class PackagePathUtility
    {
        private const string PackageName = "com.gauntletrunner2025.ugs-cli-mcp";
        private const string AssetsPath = "Assets/com.gauntletrunner2025.ugs-cli-mcp";

        public static string GetPackagePath()
        {
            if (UgsCliMcpSettings.IsDeveloperMode())
            {
                // In developer mode, use the Assets folder path
                string projectPath = Path.GetDirectoryName(Application.dataPath);
                string fullAssetsPath = Path.GetFullPath(Path.Combine(projectPath, AssetsPath));

                if (Directory.Exists(fullAssetsPath))
                {
                    Debug.Log($"Using developer mode path: {fullAssetsPath}");
                    return fullAssetsPath;
                }
                else
                {
                    Debug.LogError($"Developer mode path not found: {fullAssetsPath}");
                    return string.Empty;
                }
            }
            else
            {
                // In package mode, use the package manager path
                var packageInfo = UnityEditor.PackageManager.PackageInfo.FindForAssetPath($"Packages/{PackageName}");
                if (packageInfo != null)
                {
                    Debug.Log($"Using package mode path: {packageInfo.resolvedPath}");
                    return packageInfo.resolvedPath;
                }
                else
                {
                    Debug.LogError($"Package not found: {PackageName}");
                    return string.Empty;
                }
            }
        }
    }
}
