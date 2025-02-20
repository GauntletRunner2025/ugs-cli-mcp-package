import { z } from "zod";
import { makeNWSRequest, NWS_API_BASE } from "../utils.js";
export function registerGetAlertsHandler(server) {
    server.tool("get-alerts", "Get weather alerts for a state", {
        state: z.string().length(2),
    }, async ({ state }) => {
        const alertsUrl = `${NWS_API_BASE}/alerts/active/area/${state}`;
        const alertsData = await makeNWSRequest(alertsUrl);
        if (!alertsData || !alertsData.features) {
            return { content: [{ type: "text", text: "No alerts found" }] };
        }
        const alerts = alertsData.features
            .map((feature) => {
            const props = feature.properties;
            return `${props.headline}\nSeverity: ${props.severity}\n${props.description}\n`;
        })
            .join("\n");
        return {
            content: [
                {
                    type: "text",
                    text: alerts || "No active alerts for this state",
                },
            ],
        };
    });
}
