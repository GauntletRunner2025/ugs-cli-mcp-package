using UnityEngine;
using UnityEditor;
using System;
using System.Diagnostics;
using Debug = UnityEngine.Debug;

namespace GauntletRunner2025.UgsCliMcp.Editor
{
    public class UgsCliUtility
    {
        public class VersionCheckResult
        {
            public bool Success { get; set; }
            public string Message { get; set; }
            public Color MessageColor { get; set; }
        }

        public static void CheckVersion(Action<VersionCheckResult> onComplete)
        {
            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = "/c ugs --version",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                }
            };

            process.OutputDataReceived += (sender, args) =>
            {
                if (!string.IsNullOrEmpty(args.Data))
                {
                    EditorApplication.delayCall += () =>
                    {
                        onComplete(new VersionCheckResult
                        {
                            Success = true,
                            Message = $"✓ UGS CLI is installed (version: {args.Data})",
                            MessageColor = new Color(0.2f, 0.8f, 0.2f)
                        });
                    };
                }
            };

            process.ErrorDataReceived += (sender, args) =>
            {
                if (!string.IsNullOrEmpty(args.Data))
                {
                    EditorApplication.delayCall += () =>
                    {
                        onComplete(new VersionCheckResult
                        {
                            Success = false,
                            Message = "✗ UGS CLI is not installed or not in PATH",
                            MessageColor = new Color(0.8f, 0.2f, 0.2f)
                        });
                    };
                }
            };

            try
            {
                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();
            }
            catch (Exception ex)
            {
                EditorApplication.delayCall += () =>
                {
                    onComplete(new VersionCheckResult
                    {
                        Success = false,
                        Message = $"Error checking UGS CLI: {ex.Message}",
                        MessageColor = new Color(0.8f, 0.2f, 0.2f)
                    });
                };
            }
        }

        public static void CheckNpmVersion(Action<VersionCheckResult> onComplete)
        {
            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = "/c npm --version",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                }
            };

            process.OutputDataReceived += (sender, args) =>
            {
                if (!string.IsNullOrEmpty(args.Data))
                {
                    EditorApplication.delayCall += () =>
                    {
                        onComplete(new VersionCheckResult
                        {
                            Success = true,
                            Message = $"✓ npm is installed (version: {args.Data})",
                            MessageColor = new Color(0.2f, 0.8f, 0.2f)
                        });
                    };
                }
            };

            process.ErrorDataReceived += (sender, args) =>
            {
                if (!string.IsNullOrEmpty(args.Data))
                {
                    EditorApplication.delayCall += () =>
                    {
                        onComplete(new VersionCheckResult
                        {
                            Success = false,
                            Message = "✗ npm is not installed or not in PATH",
                            MessageColor = new Color(0.8f, 0.2f, 0.2f)
                        });
                    };
                }
            };

            try
            {
                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();
            }
            catch (Exception ex)
            {
                EditorApplication.delayCall += () =>
                {
                    onComplete(new VersionCheckResult
                    {
                        Success = false,
                        Message = $"Error checking npm: {ex.Message}",
                        MessageColor = new Color(0.8f, 0.2f, 0.2f)
                    });
                };
            }
        }

        public static void Install(Action<string> onProgressUpdate, Action onComplete)
        {
            onProgressUpdate("Starting npm installation...");
            var wasSuccessful = false;

            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = "/c npm install -g ugs",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                }
            };

            process.OutputDataReceived += (sender, args) =>
            {
                if (!string.IsNullOrEmpty(args.Data))
                {
                    EditorApplication.delayCall += () =>
                    {
                        if (args.Data.Contains("npm http"))
                        {
                            onProgressUpdate("Downloading package...");
                        }
                        else if (args.Data.Contains("added") || args.Data.Contains("changed"))
                        {
                            wasSuccessful = true;
                            onProgressUpdate("Package installed successfully! Now try getting the UGS CLI version, to continue.");
                        }
                        else
                        {
                            onProgressUpdate(args.Data);
                        }
                    };
                }
            };

            process.ErrorDataReceived += (sender, args) =>
            {
                if (!string.IsNullOrEmpty(args.Data))
                {
                    EditorApplication.delayCall += () =>
                    {
                        wasSuccessful = false;
                        onProgressUpdate($"Error: {args.Data}");
                    };
                }
            };

            process.Exited += (sender, args) =>
            {
                EditorApplication.delayCall += () =>
                {
                    if (wasSuccessful)
                    {
                        onComplete();
                    }
                };
            };

            try
            {
                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();
            }
            catch (Exception ex)
            {
                EditorApplication.delayCall += () =>
                {
                    wasSuccessful = false;
                    onProgressUpdate($"Error: {ex.Message}");
                };
            }
        }
    }
}
