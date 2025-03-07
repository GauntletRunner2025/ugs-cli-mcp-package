using UnityEngine;
using UnityEngine.UIElements;
using UnityEditor;
using System;
using System.Diagnostics;

    public partial class InstallationGuideWindow : BaseInstallationWindow
    {
        private Button previousButton;
        private Button nextButton;
        private Button checkVersionButton;
        private Button checkNpmButton;
        private Button installUgsButton;
        private Button simulateNotInstalledButton;
        private Button checkLoginButton;
        private Button loginButton;
        private Button doneButton;
        private Label versionResultLabel;
        private Label npmVersionResultLabel;
        private Label installProgressLabel;
        private Label loginStatusResultLabel;
        private VisualElement npmCheckContainer;
        private VisualElement loginContainer;
        private InstallationStepManager stepManager;
        private bool isNpmInstalled = false;

        protected override void OnUICreated()
        {
            SetupUI();
        }

        private void SetupUI()
        {
            // Get UI elements
            previousButton = rootVisualElement.Q<Button>("previous-button");
            nextButton = rootVisualElement.Q<Button>("next-button");
            checkVersionButton = rootVisualElement.Q<Button>("check-version-button");
            checkNpmButton = rootVisualElement.Q<Button>("check-npm-button");
            installUgsButton = rootVisualElement.Q<Button>("install-ugs-button");
            simulateNotInstalledButton = rootVisualElement.Q<Button>("debug-simulate-button");
            // Hide debug button by default, show only if MCPDeveloperMode is enabled
            simulateNotInstalledButton.style.display = EditorPrefs.GetBool("MCPDeveloperMode", false) 
                ? DisplayStyle.Flex 
                : DisplayStyle.None;
            checkLoginButton = rootVisualElement.Q<Button>("check-login-button");
            loginButton = rootVisualElement.Q<Button>("login-button");
            doneButton = rootVisualElement.Q<Button>("done-button");
            versionResultLabel = rootVisualElement.Q<Label>("version-result");
            npmVersionResultLabel = rootVisualElement.Q<Label>("npm-version-result");
            installProgressLabel = rootVisualElement.Q<Label>("install-progress");
            loginStatusResultLabel = rootVisualElement.Q<Label>("login-status-result");
            npmCheckContainer = rootVisualElement.Q<VisualElement>("npm-check-container");
            loginContainer = rootVisualElement.Q<VisualElement>("login-container");

            // Initialize step manager
            stepManager = new InstallationStepManager(rootVisualElement);
            stepManager.OnCanNavigateNextChanged += canNavigate => nextButton.SetEnabled(canNavigate);
            stepManager.OnCanNavigatePreviousChanged += canNavigate => previousButton.SetEnabled(canNavigate);
            stepManager.OnStepChanged += OnStepChanged;

            // Setup button clicks
            previousButton.clicked += () => stepManager.NavigateStep(-1);
            nextButton.clicked += () => stepManager.NavigateStep(1);
            checkVersionButton.clicked += CheckUgsVersion;
            checkNpmButton.clicked += CheckNpmVersion;
            installUgsButton.clicked += InstallUgs;
            simulateNotInstalledButton.clicked += SimulateUgsNotInstalled;
            checkLoginButton.clicked += CheckLoginStatus;
            loginButton.clicked += LoginToUgs;
            doneButton.clicked += OnDoneButtonClicked;

            // Setup project ID UI
            SetupProjectIdUI();

            // Setup MCP config UI
            SetupMcpConfigUI();

            // Show first step
            stepManager.NavigateStep(0);
        }

        private void OnStepChanged(int stepIndex)
        {
            bool isLastStep = stepIndex == stepManager.TotalSteps - 1;
            nextButton.text = isLastStep ? "Done" : "Next";
            nextButton.style.display = isLastStep ? DisplayStyle.None : DisplayStyle.Flex;
            doneButton.style.display = isLastStep ? DisplayStyle.Flex : DisplayStyle.None;
        }

        private void OnDoneButtonClicked()
        {
            // throw new NotImplementedException();
            //Close the Editor Window
            Close();
        }

        private void LoginToUgs()
        {
            loginButton.SetEnabled(false);
            loginStatusResultLabel.text = "Opening terminal for login...";
            loginStatusResultLabel.style.color = Color.white;

            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = "/c start cmd /k ugs login",
                    UseShellExecute = true,
                    CreateNoWindow = false
                }
            };

            try
            {
                process.Start();
                loginStatusResultLabel.text = "Please complete login in the terminal window, then click 'Check UGS Login Status'";
                loginStatusResultLabel.style.color = Color.white;
                loginButton.SetEnabled(true);
            }
            catch (Exception ex)
            {
                loginStatusResultLabel.text = $"Error opening terminal: {ex.Message}";
                loginStatusResultLabel.style.color = new Color(0.8f, 0.2f, 0.2f);
                loginButton.SetEnabled(true);
            }
        }
    }