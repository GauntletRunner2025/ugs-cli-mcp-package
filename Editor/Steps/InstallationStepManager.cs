using UnityEngine.UIElements;
using System;
using UnityEngine;

namespace GauntletRunner2025.UgsCliMcp.Editor
{
    public class InstallationStepManager
    {
        private readonly VisualElement rootElement;
        private readonly string[] steps = { "step-1", "step-2", "step-3", "step-4", "step-5", "step-6" };
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

            // Reset completion state for the new step
            stepCompleted[currentStep] = false;

            // Show current step
            rootElement.Q<VisualElement>(steps[currentStep]).style.display = DisplayStyle.Flex;

            // Auto-complete final step since it's just instructions
            if (currentStep == steps.Length - 1)
            {
                stepCompleted[currentStep] = true;
            }

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
            var canNavigatePrevious = currentStep > 0;
            var canNavigateNext = currentStep < steps.Length - 1 && stepCompleted[currentStep];

            Debug.Log($"Step {currentStep} navigation state - Previous: {canNavigatePrevious}, Next: {canNavigateNext}, Completed: {stepCompleted[currentStep]}");

            OnCanNavigatePreviousChanged?.Invoke(canNavigatePrevious);
            OnCanNavigateNextChanged?.Invoke(canNavigateNext);
        }

        public int CurrentStepIndex => currentStep;
    }
}
