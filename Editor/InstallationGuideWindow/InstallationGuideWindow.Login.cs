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

            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = "/c ugs status",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                }
            };

            var output = new StringBuilder();
            var error = new StringBuilder();

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
                EditorApplication.delayCall += () =>
                {
                    checkLoginButton.SetEnabled(true);
                    var outputText = output.ToString().Trim();
                    var errorText = error.ToString().Trim();
                    
                    // Clean up the output text
                    outputText = outputText.Replace("\r", "").Replace("\n", " ").Trim();
                    errorText = errorText.Replace("\r", "").Replace("\n", " ").Trim();
                    
                    Debug.Log($"UGS Status Output (cleaned): '{outputText}'");
                    Debug.Log($"UGS Status Error (cleaned): '{errorText}'");

                    // Check both output and error streams
                    var combinedText = $"{outputText} {errorText}";
                    loginStatusResultLabel.text = combinedText.Trim();

                    if (combinedText.Contains("[Information]") && combinedText.Contains("No Service Account key stored"))
                    {
                        Debug.Log("Login check: Found not logged in message");
                        // Not logged in - show login container and button
                        loginStatusResultLabel.style.color = new Color(0.8f, 0.2f, 0.2f);
                        loginContainer.style.display = DisplayStyle.Flex;
                        loginButton.SetEnabled(true);
                        stepManager.SetStepCompletion(false);
                    }
                    else if (combinedText.Contains("[Information]") && combinedText.Contains("Using Service Account key"))
                    {
                        Debug.Log("Login check: Found success message");
                        // Successfully logged in
                        loginStatusResultLabel.style.color = new Color(0.2f, 0.8f, 0.2f);
                        loginContainer.style.display = DisplayStyle.None;
                        stepManager.SetStepCompletion(true);
                    }
                    else
                    {
                        Debug.Log("Login check: Unexpected response");
                        // Unexpected response
                        loginStatusResultLabel.style.color = Color.yellow;
                        loginContainer.style.display = DisplayStyle.None;
                        stepManager.SetStepCompletion(false);
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
                    checkLoginButton.SetEnabled(true);
                    loginStatusResultLabel.text = $"Error checking login status: {ex.Message}";
                    loginStatusResultLabel.style.color = new Color(0.8f, 0.2f, 0.2f);
                    loginContainer.style.display = DisplayStyle.None;
                    stepManager.SetStepCompletion(false);
                };
            }
        }

    }