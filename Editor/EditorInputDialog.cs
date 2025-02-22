using UnityEngine;
using UnityEditor;

namespace Gauntletrunner2025.UgsCliMcp.Editor
{
    public class EditorInputDialog : EditorWindow
    {
        private string title;
        private string message;
        private string input;
        private string defaultValue;
        private bool isCancelled;
        private static EditorInputDialog window;

        public static string Show(string title, string message, string defaultValue = "")
        {
            window = CreateInstance<EditorInputDialog>();
            window.titleContent = new GUIContent("Input Required");
            window.title = title;
            window.message = message;
            window.defaultValue = defaultValue;
            window.input = defaultValue;
            window.isCancelled = false;
            window.position = new Rect(Screen.currentResolution.width / 2, Screen.currentResolution.height / 2, 300, 100);
            window.ShowModal();

            return window.isCancelled ? null : window.input;
        }

        private void OnGUI()
        {
            EditorGUILayout.LabelField(title, EditorStyles.boldLabel);
            EditorGUILayout.LabelField(message);
            
            GUI.SetNextControlName("InputField");
            input = EditorGUILayout.TextField(input);

            // Focus the input field when the window opens
            if (Event.current.type == EventType.Repaint)
            {
                GUI.FocusControl("InputField");
            }

            // Handle Enter key to submit
            if (Event.current.type == EventType.KeyDown && Event.current.keyCode == KeyCode.Return)
            {
                Close();
                return;
            }

            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button("OK"))
            {
                Close();
            }
            if (GUILayout.Button("Cancel"))
            {
                isCancelled = true;
                Close();
            }
            EditorGUILayout.EndHorizontal();
        }
    }
}
