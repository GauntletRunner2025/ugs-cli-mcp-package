using UnityEngine;
using UnityEditor;
using UnityEditor.PackageManager;
using System.IO;

namespace Gauntletrunner2025.UgsCliMcp.Editor.Utilities
{
    public static class PackagePathUtility
    {
        private static readonly string PackageName = "ugs-cli-mcp-package";
        private static readonly string AssetsPath = Path.Combine("Assets", "ugs-cli-mcp-package");
        private const string DeveloperModeKey = "MCPDeveloperMode";

        public static string GetPackagePath()
        {
            var isDeveloperMode = EditorPrefs.GetBool(DeveloperModeKey, false);
            if (isDeveloperMode)
            {
                Debug.Log("[Debug] MCPDeveloperMode is true");
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
                var packageInfo = UnityEditor.PackageManager.PackageInfo.FindForAssetPath(Path.Combine("Packages", PackageName));
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
