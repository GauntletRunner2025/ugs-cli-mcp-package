using UnityEngine;
using UnityEditor;
using UnityEngine.UIElements;

namespace GauntletRunner2025.UgsCliMcp.Editor
{
    public partial class InstallationGuideWindow
    {
        private void CheckNpmVersion()
        {
            checkNpmButton.SetEnabled(false);
            npmVersionResultLabel.text = "Checking npm version...";
            installUgsButton.SetEnabled(false);

            UgsCliUtility.CheckNpmVersion(result =>
            {
                npmVersionResultLabel.text = result.Message;
                npmVersionResultLabel.style.color = result.MessageColor;
                checkNpmButton.SetEnabled(true);
                isNpmInstalled = result.Success;

                if (result.Success)
                {
                    installUgsButton.style.display = DisplayStyle.Flex;
                    installUgsButton.SetEnabled(true);
                }
                else
                {
                    installUgsButton.style.display = DisplayStyle.None;
                }
            });
        }

        private void InstallUgs()
        {
            if (!isNpmInstalled)
            {
                versionResultLabel.text = "Please verify npm is installed first";
                versionResultLabel.style.color = Color.yellow;
                return;
            }

            installUgsButton.SetEnabled(false);
            installProgressLabel.style.display = DisplayStyle.Flex;
            installProgressLabel.text = "Starting npm installation...";
            installProgressLabel.style.color = Color.white;

            UgsCliUtility.Install(
                message =>
                {
                    installProgressLabel.text = message;
                    installProgressLabel.style.color = Color.white;
                },
                () =>
                {
                    installUgsButton.SetEnabled(true);
                    installProgressLabel.text = "✓ UGS CLI installed successfully!";
                    installProgressLabel.style.color = new Color(0.2f, 0.8f, 0.2f);
                    versionResultLabel.text = "✓ UGS CLI is now installed and ready to use";
                    versionResultLabel.style.color = new Color(0.2f, 0.8f, 0.2f);
                    installUgsButton.style.display = DisplayStyle.None;
                    stepManager.SetStepCompletion(true);
                }
            );
        }
    }
}
