using UnityEngine;
using UnityEditor;
using System.Diagnostics;

namespace Gauntletrunner2025.UgsCliMcp.Editor
{
    public static class ConfigurationCommands
    {
        private static string RunUgsCommand(string arguments)
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = "cmd.exe",
                Arguments = $"/c ugs {arguments}",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };

            using (var process = Process.Start(startInfo))
            {
                string output = process.StandardOutput.ReadToEnd();
                string error = process.StandardError.ReadToEnd();
                process.WaitForExit();

                if (process.ExitCode != 0 || !string.IsNullOrEmpty(error))
                {
                    throw new System.Exception($"Command failed: {error}");
                }

                return output.Trim();
            }
        }

        [MenuItem("Tools/UGS CLI MCP/Show Current Configuration")]
        private static void ShowCurrentConfiguration()
        {
            try
            {
                string ugsProjectId = RunUgsCommand("config get project-id");
                string unityProjectId = CloudProjectSettings.projectId;

                UnityEngine.Debug.Log($"Project ID comparison:\n" +
                    $"UGS CLI: {ugsProjectId}\n" +
                    $"Unity: {unityProjectId}\n" +
                    $"Match: {ugsProjectId == unityProjectId}");
            }
            catch (System.Exception ex)
            {
                UnityEngine.Debug.LogError($"Failed to get UGS configuration: {ex.Message}");
            }
        }
    }
}
