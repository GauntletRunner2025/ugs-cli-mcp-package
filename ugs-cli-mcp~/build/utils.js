export const NWS_API_BASE = "https://api.weather.gov";
export const USER_AGENT = "weather-app/1.0";
export async function makeNWSRequest(url) {
    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": USER_AGENT,
            },
        });
        if (!response.ok) {
            return null;
        }
        return await response.json();
    }
    catch (error) {
        console.error("Error making NWS request:", error);
        return null;
    }
}
