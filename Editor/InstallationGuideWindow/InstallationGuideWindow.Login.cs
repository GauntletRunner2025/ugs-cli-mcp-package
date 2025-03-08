using UnityEngine;
using System.Diagnostics;
using System.Text;
using System;
using UnityEditor;
using Debug = UnityEngine.Debug;
using UnityEngine.UIElements;

    public partial class InstallationGuideWindow
    {
        private void CheckLoginStatus()
        {
            checkLoginButton.SetEnabled(false);
            loginContainer.style.display = DisplayStyle.None;
            loginStatusResultLabel.text = "Checking UGS login status...";
            loginStatusResultLabel.style.color = Color.white;
            stepManager.SetStepCompletion(false);

            var process = new Process();
            try
            {
                process.StartInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = "/c ugs status",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                };

                var output = new StringBuilder();
                var error = new StringBuilder();
                var processExited = false;

                process.OutputDataReceived += (sender, args) =>
                {
                    if (!string.IsNullOrEmpty(args.Data))
                    {
                        output.AppendLine(args.Data.TrimEnd());
                    }
                };

                process.ErrorDataReceived += (sender, args) =>
                {
                    if (!string.IsNullOrEmpty(args.Data))
                    {
                        error.AppendLine(args.Data.TrimEnd());
                    }
                };

                process.EnableRaisingEvents = true;
                process.Exited += (sender, args) =>
                {
                    processExited = true;
                    ProcessLoginStatus(output.ToString().Trim(), error.ToString().Trim());
                };

                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();

                // Start timeout coroutine
                EditorApplication.update += () =>
                {
                    if (processExited)
                    {
                        EditorApplication.update -= CheckTimeout;
                        return;
                    }

                    CheckTimeout();
                };

                void CheckTimeout()
                {
                    if (!process.HasExited && (DateTime.Now - process.StartTime).TotalSeconds > 10)
                    {
                        try
                        {
                            process.Kill();
                        }
                        catch (Exception ex)
                        {
                            LogDebug($"Error killing process: {ex.Message}", true);
                        }
                        ProcessLoginStatus("", "Process timed out after 10 seconds");
                    }
                }
            }
            catch (Exception ex)
            {
                ProcessLoginStatus("", $"Error starting process: {ex.Message}");
                if (process != null)
                {
                    try { process.Dispose(); } catch { }
                }
            }
        }

        private void ProcessLoginStatus(string outputText, string errorText)
        {
            EditorApplication.delayCall += () =>
            {
                checkLoginButton.SetEnabled(true);

                // Clean up the output text
                outputText = outputText.Replace("\r", "").Replace("\n", " ").Trim();
                errorText = errorText.Replace("\r", "").Replace("\n", " ").Trim();

                LogDebug($"UGS Status Output (cleaned): '{outputText}'", true);
                LogDebug($"UGS Status Error (cleaned): '{errorText}'", true);

                // Check both output and error streams
                var combinedText = $"{outputText} {errorText}".Trim();

                if (string.IsNullOrEmpty(combinedText))
                {
                    loginStatusResultLabel.text = "Error: No response from UGS CLI";
                    loginStatusResultLabel.style.color = new Color(0.8f, 0.2f, 0.2f);
                    loginContainer.style.display = DisplayStyle.None;
                    stepManager.SetStepCompletion(false);
                    return;
                }

                if (errorText.Contains("timed out"))
                {
                    loginStatusResultLabel.text = "Error: UGS CLI not responding";
                    loginStatusResultLabel.style.color = new Color(0.8f, 0.2f, 0.2f);
                    loginContainer.style.display = DisplayStyle.None;
                    stepManager.SetStepCompletion(false);
                    return;
                }

                if (combinedText.Contains("[Information]") && combinedText.Contains("No Service Account key stored"))
                {
                    LogDebug("Login check: Found not logged in message", true);
                    loginStatusResultLabel.text = "Not logged in to UGS";
                    loginStatusResultLabel.style.color = new Color(0.8f, 0.2f, 0.2f);
                    loginContainer.style.display = DisplayStyle.Flex;
                    loginButton.SetEnabled(true);
                    stepManager.SetStepCompletion(false);
                }
                else if (combinedText.Contains("[Information]") && combinedText.Contains("Using Service Account key"))
                {
                    LogDebug("Login check: Found success message", true);
                    loginStatusResultLabel.text = "Successfully logged in to UGS";
                    loginStatusResultLabel.style.color = new Color(0.2f, 0.8f, 0.2f);
                    loginContainer.style.display = DisplayStyle.None;
                    stepManager.SetStepCompletion(true);
                }
                else
                {
                    LogDebug("Login check: Unexpected response", true);
                    loginStatusResultLabel.text = "Unexpected response from UGS CLI";
                    loginStatusResultLabel.style.color = Color.yellow;
                    loginContainer.style.display = DisplayStyle.None;
                    stepManager.SetStepCompletion(false);
                }
            };
        }
    }