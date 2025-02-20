import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
/**
 * Validates and retrieves a project ID, either from the provided parameter or from UGS configuration
 * @param providedProjectId Optional project ID provided by the user
 * @returns ProjectValidationResult containing validation status and either a project ID or error message
 */
export async function validateProjectId(providedProjectId) {
    try {
        // First check if there's a configured project ID
        const { stdout: configuredProjectId } = await execAsync('ugs config get project-id');
        const trimmedConfigId = configuredProjectId.trim();
        // Validate project ID
        if (!providedProjectId && !trimmedConfigId) {
            return {
                isValid: false,
                error: "No project ID provided and none configured. Please provide a project ID or configure one using 'ugs config set project-id'"
            };
        }
        // Use provided project ID or fall back to configured one
        const finalProjectId = providedProjectId || trimmedConfigId;
        return {
            isValid: true,
            projectId: finalProjectId
        };
    }
    catch (error) {
        return {
            isValid: false,
            error: error?.message || String(error)
        };
    }
}
