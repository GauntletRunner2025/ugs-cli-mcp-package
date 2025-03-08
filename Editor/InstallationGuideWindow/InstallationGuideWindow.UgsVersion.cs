using UnityEngine;
using UnityEditor;
using UnityEngine.UIElements;

    public partial class InstallationGuideWindow
    {
        private void CheckUgsVersion()
        {
            stepManager.ResetCurrentStep();
            checkVersionButton.SetEnabled(false);
            npmCheckContainer.style.display = DisplayStyle.None;
            installUgsButton.style.display = DisplayStyle.None;
            installProgressLabel.style.display = DisplayStyle.None;
            versionResultLabel.text = "Checking UGS CLI version...";

            UgsCliUtility.CheckVersion(result =>
            {
                versionResultLabel.text = result.Message;
                versionResultLabel.style.color = result.MessageColor;
                checkVersionButton.SetEnabled(true);

                if (result.Success)
                {
                    npmCheckContainer.style.display = DisplayStyle.None;
                    installUgsButton.style.display = DisplayStyle.None;
                    stepManager.SetStepCompletion(true);
                }
                else
                {
                    npmCheckContainer.style.display = DisplayStyle.Flex;
                    stepManager.SetStepCompletion(false);
                }
            });
        }

        private void SimulateUgsNotInstalled()
        {
            LogDebug("Simulating UGS CLI not installed", false);
            versionResultLabel.text = "UGS CLI is not installed";
            versionResultLabel.style.color = Color.red;
            npmCheckContainer.style.display = DisplayStyle.Flex;
            installUgsButton.style.display = DisplayStyle.None;
            stepManager.SetStepCompletion(false);
            simulateNotInstalledButton.style.display = DisplayStyle.None;
        }
    }