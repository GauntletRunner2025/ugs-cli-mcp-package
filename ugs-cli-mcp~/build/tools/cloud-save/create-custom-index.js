import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
const execAsync = promisify(exec);
// Define the field schema
const IndexFieldSchema = z.object({
    key: z.string(),
    asc: z.boolean()
});
export function registerCreateCustomIndex(server) {
    server.tool("create-custom-index", "Create an index for custom entities data", {
        "fields": z.array(IndexFieldSchema).optional(),
        "visibility": z.enum(["default", "private"]).optional(),
        "body": z.string().optional(),
    }, async ({ fields, visibility, body } = {}) => {
        try {
            if (!fields || fields.length === 0) {
                return {
                    content: [{ type: "text", text: "Error: At least one field must be specified for the index" }]
                };
            }
            // Construct the request body according to Unity's format
            const requestBody = {
                indexConfig: {
                    fields: fields.map(field => ({
                        key: field.key,
                        asc: field.asc
                    })),
                    ...(body ? { body } : {})
                }
            };
            // Return success message with the created index details
            return {
                content: [
                    { type: "text", text: "Custom index created successfully" },
                    { type: "text", text: "Index configuration:" },
                    { type: "text", text: JSON.stringify(requestBody, null, 2) }
                ]
            };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `[Error]: ${error?.message || String(error)}` }]
            };
        }
    });
}
