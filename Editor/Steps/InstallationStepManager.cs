using UnityEngine.UIElements;
using System;

namespace GauntletRunner2025.UgsCliMcp.Editor
{
    public class InstallationStepManager
    {
        private readonly VisualElement rootElement;
        private readonly string[] steps = { "step-1", "step-2", "step-3" };
        private readonly bool[] stepCompleted;
        private int currentStep = 0;

        public event Action<bool> OnStepCompletionChanged;
        public event Action<bool> OnCanNavigateNextChanged;
        public event Action<bool> OnCanNavigatePreviousChanged;

        public InstallationStepManager(VisualElement rootElement)
        {
            this.rootElement = rootElement;
            stepCompleted = new bool[steps.Length];
        }

        public void NavigateStep(int direction)
        {
            // Hide all steps
            foreach (var step in steps)
            {
                rootElement.Q<VisualElement>(step).style.display = DisplayStyle.None;
            }

            currentStep += direction;
            
            // Handle bounds
            if (currentStep <= 0)
            {
                currentStep = 0;
            }
            else if (currentStep >= steps.Length - 1)
            {
                currentStep = steps.Length - 1;
            }

            // Show current step
            rootElement.Q<VisualElement>(steps[currentStep]).style.display = DisplayStyle.Flex;

            UpdateNavigationState();
        }

        public void SetStepCompletion(bool completed)
        {
            stepCompleted[currentStep] = completed;
            OnStepCompletionChanged?.Invoke(completed);
            UpdateNavigationState();
        }

        public void ResetCurrentStep()
        {
            stepCompleted[currentStep] = false;
            UpdateNavigationState();
        }

        private void UpdateNavigationState()
        {
            OnCanNavigatePreviousChanged?.Invoke(currentStep > 0);
            OnCanNavigateNextChanged?.Invoke(currentStep < steps.Length - 1 && stepCompleted[currentStep]);
        }

        public int CurrentStepIndex => currentStep;
    }
}
