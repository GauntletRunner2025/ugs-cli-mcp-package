using UnityEditor;
using UnityEngine;

namespace Unity.Services.Cli.Mcp.Editor
{
    public abstract class InstallationStep
    {
        protected const string MenuRoot = "MCP Installation/";
        private const string PrefsKeyPrefix = "MCPInstallation_Step";

        protected readonly int StepNumber;
        protected readonly string StepName;

        protected InstallationStep(int stepNumber, string stepName)
        {
            StepNumber = stepNumber;
            StepName = stepName;
        }

        protected bool GetStepStatus()
        {
            return EditorPrefs.GetBool($"{PrefsKeyPrefix}{StepNumber}", false);
        }

        protected void SetStepStatus(bool completed)
        {
            EditorPrefs.SetBool($"{PrefsKeyPrefix}{StepNumber}", completed);
        }

        protected string MenuPath => $"{MenuRoot}{StepNumber}. {StepName}";
    }
}
