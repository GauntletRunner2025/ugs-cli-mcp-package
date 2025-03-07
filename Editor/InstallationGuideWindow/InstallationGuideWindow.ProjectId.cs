using UnityEngine;
using UnityEngine.UIElements;
using UnityEditor;
using System;
using System.Diagnostics;
using System.Text;
using Debug = UnityEngine.Debug;
using System.Collections.Generic;

    public partial class InstallationGuideWindow
    {
        private Button setProjectIdButton;
        private Label projectIdResultLabel;
        private DropdownField environmentNameDropdown;
        private Button setEnvironmentButton;
        private Label environmentResultLabel;

        private void SetupProjectIdUI()
        {
            setProjectIdButton = rootVisualElement.Q<Button>("set-project-id-button");
            projectIdResultLabel = rootVisualElement.Q<Label>("project-id-result");
            environmentNameDropdown = rootVisualElement.Q<DropdownField>("environment-name-dropdown");
            setEnvironmentButton = rootVisualElement.Q<Button>("set-environment-button");
            environmentResultLabel = rootVisualElement.Q<Label>("environment-result");

            // Disable environment controls until project ID is set
            environmentNameDropdown.SetEnabled(false);
            setEnvironmentButton.SetEnabled(false);

            setProjectIdButton.clicked += SetProjectId;
            setEnvironmentButton.clicked += SetEnvironment;

            // Set initial dropdown state
            environmentNameDropdown.label = "Select Environment";
            environmentNameDropdown.choices = new List<string>();
        }

        private void FetchEnvironments()
        {
            var projectId = CloudProjectSettings.projectId;
            environmentResultLabel.text = "Fetching environments...";
            environmentResultLabel.style.color = Color.white;

            // Default to production environment while we fetch the list
            environmentNameDropdown.choices = new List<string> { "production" };
            environmentNameDropdown.value = "production";
            environmentNameDropdown.SetEnabled(true);
            setEnvironmentButton.SetEnabled(true);

            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = $"/c ugs env list",
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
                    var outputText = output.ToString().Trim();
                    var errorText = error.ToString().Trim();

                    Debug.Log($"Fetch Environments Output: '{outputText}'");
                    Debug.Log($"Fetch Environments Error: '{errorText}'");

                    // Combine output and error since UGS CLI uses [Error] and [Information] prefixes
                    var combinedText = $"{outputText} {errorText}".Trim();

                    if (!combinedText.Contains("[Error]"))
                    {
                        // Parse environments from output
                        var environments = ParseEnvironments(outputText);
                        if (environments.Count > 0)
                        {
                            environmentNameDropdown.choices = environments;
                            // Keep production selected if it exists, otherwise select first
                            if (environments.Contains("production"))
                            {
                                environmentNameDropdown.value = "production";
                            }
                            else
                            {
                                environmentNameDropdown.value = environments[0];
                            }
                            environmentResultLabel.text = $"Found {environments.Count} environments";
                            environmentResultLabel.style.color = new Color(0.2f, 0.8f, 0.2f);
                        }
                        else
                        {
                            // Keep production as default if no environments found
                            environmentResultLabel.text = "Using default environment: production";
                            environmentResultLabel.style.color = new Color(0.2f, 0.8f, 0.2f);
                        }
                    }
                    else
                    {
                        // Keep production as default if error occurs
                        environmentResultLabel.text = "Using default environment: production";
                        environmentResultLabel.style.color = new Color(0.2f, 0.8f, 0.2f);
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
                    // Keep production as default if error occurs
                    environmentResultLabel.text = "Using default environment: production";
                    environmentResultLabel.style.color = new Color(0.2f, 0.8f, 0.2f);
                };
            }
        }

        private List<string> ParseEnvironments(string output)
        {
            var environments = new List<string>();
            var lines = output.Split('\n');

            foreach (var line in lines)
            {
                var trimmedLine = line.Trim();
                if (!string.IsNullOrEmpty(trimmedLine) &&
                    !trimmedLine.StartsWith("[") && // Skip [Information] lines
                    !trimmedLine.Contains("Environment Name")) // Skip header
                {
                    environments.Add(trimmedLine);
                }
            }

            return environments;
        }

        private void SetProjectId()
        {
            setProjectIdButton.SetEnabled(false);
            var projectId = CloudProjectSettings.projectId;
            projectIdResultLabel.text = $"Setting project ID to: {projectId}";
            projectIdResultLabel.style.color = Color.white;

            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = $"/c ugs config set project-id {projectId}",
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
                    setProjectIdButton.SetEnabled(true);
                    var outputText = output.ToString().Trim();
                    var errorText = error.ToString().Trim();

                    Debug.Log($"Set Project ID Output: '{outputText}'");
                    Debug.Log($"Set Project ID Error: '{errorText}'");

                    // Combine output and error since UGS CLI uses [Error] and [Information] prefixes
                    var combinedText = $"{outputText} {errorText}".Trim();

                    if (!combinedText.Contains("[Error]"))
                    {
                        projectIdResultLabel.text = $"✓ Successfully set project ID to: {projectId}";
                        projectIdResultLabel.style.color = new Color(0.2f, 0.8f, 0.2f);
                        Debug.Log("Project ID set successfully, completing step 3");
                        stepManager.SetStepCompletion(true);

                        // Verify the setting
                        VerifyProjectIdSetting();

                        // Fetch environments after successful project ID set
                        FetchEnvironments();
                    }
                    else
                    {
                        projectIdResultLabel.text = combinedText;
                        projectIdResultLabel.style.color = new Color(0.8f, 0.2f, 0.2f);
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
                    setProjectIdButton.SetEnabled(true);
                    projectIdResultLabel.text = $"Error: {ex.Message}";
                    projectIdResultLabel.style.color = new Color(0.8f, 0.2f, 0.2f);
                    stepManager.SetStepCompletion(false);
                };
            }
        }

        private void SetEnvironment()
        {
            setEnvironmentButton.SetEnabled(false);
            var environmentName = environmentNameDropdown.value;
            environmentResultLabel.text = $"Setting environment to: {environmentName}";
            environmentResultLabel.style.color = Color.white;

            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = $"/c ugs config set environment-name {environmentName}",
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
                    setEnvironmentButton.SetEnabled(true);
                    var outputText = output.ToString().Trim();
                    var errorText = error.ToString().Trim();

                    Debug.Log($"Set Environment Output: '{outputText}'");
                    Debug.Log($"Set Environment Error: '{errorText}'");

                    // Combine output and error since UGS CLI uses [Error] and [Information] prefixes
                    var combinedText = $"{outputText} {errorText}".Trim();

                    if (!combinedText.Contains("[Error]"))
                    {
                        environmentResultLabel.text = $"✓ Successfully set environment to: {environmentName}";
                        environmentResultLabel.style.color = new Color(0.2f, 0.8f, 0.2f);
                        stepManager.SetStepCompletion(true);

                        // Verify the setting
                        VerifyEnvironmentSetting();
                    }
                    else
                    {
                        environmentResultLabel.text = combinedText;
                        environmentResultLabel.style.color = new Color(0.8f, 0.2f, 0.2f);
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
                    setEnvironmentButton.SetEnabled(true);
                    environmentResultLabel.text = $"Error: {ex.Message}";
                    environmentResultLabel.style.color = new Color(0.8f, 0.2f, 0.2f);
                    stepManager.SetStepCompletion(false);
                };
            }
        }

        private void VerifyEnvironmentSetting()
        {
            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = "/c ugs config get environment-name",
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
                    var outputText = output.ToString().Trim();
                    var errorText = error.ToString().Trim();
                    var environmentName = environmentNameDropdown.value;

                    Debug.Log($"Verify Environment Output: '{outputText}'");
                    Debug.Log($"Verify Environment Error: '{errorText}'");

                    // Combine output and error since UGS CLI uses [Error] and [Information] prefixes
                    var combinedText = $"{outputText} {errorText}".Trim();

                    if (!combinedText.Contains("[Error]") && outputText.Trim() == environmentName)
                    {
                        environmentResultLabel.text = $"✓ Environment verified: {environmentName}";
                        environmentResultLabel.style.color = new Color(0.2f, 0.8f, 0.2f);

                        // Only complete the step if both project ID and environment are set
                        if (projectIdResultLabel.text.StartsWith("✓"))
                        {
                            stepManager.SetStepCompletion(true);
                        }
                    }
                    else
                    {
                        var message = combinedText.Contains("[Error]") ?
                            combinedText :
                            $"Warning: Environment mismatch. Expected: {environmentName}, Got: {outputText}";
                        environmentResultLabel.text = message;
                        environmentResultLabel.style.color = Color.yellow;
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
                Debug.LogError($"Error verifying environment: {ex.Message}");
            }
        }

        private void VerifyProjectIdSetting()
        {
            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = "/c ugs config get project-id",
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
                    var outputText = output.ToString().Trim();
                    var errorText = error.ToString().Trim();
                    var projectId = CloudProjectSettings.projectId;

                    Debug.Log($"Verify Project ID Output: '{outputText}'");
                    Debug.Log($"Verify Project ID Error: '{errorText}'");

                    // Combine output and error since UGS CLI uses [Error] and [Information] prefixes
                    var combinedText = $"{outputText} {errorText}".Trim();

                    if (!combinedText.Contains("[Error]") && outputText.Trim() == projectId.Trim())
                    {
                        projectIdResultLabel.text = $"✓ Project ID verified: {projectId}";
                        projectIdResultLabel.style.color = new Color(0.2f, 0.8f, 0.2f);
                        stepManager.SetStepCompletion(true);
                    }
                    else
                    {
                        var message = combinedText.Contains("[Error]") ?
                            combinedText :
                            $"Warning: Project ID mismatch. Expected: {projectId}, Got: {outputText}";
                        projectIdResultLabel.text = message;
                        projectIdResultLabel.style.color = Color.yellow;
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
                Debug.LogError($"Error verifying project ID: {ex.Message}");
            }
        }
    }