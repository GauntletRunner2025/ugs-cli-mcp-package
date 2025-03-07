using System.Collections.Generic;
using Newtonsoft.Json;

namespace GauntletRunner2025.UgsCliMcp.Editor.Models
{
    public class McpServerConfig
    {
        [JsonProperty("command")]
        public string Command { get; set; }

        [JsonProperty("args")]
        public List<string> Args { get; set; }
    }

    public class McpConfig
    {
        [JsonProperty("mcpServers")]
        public Dictionary<string, McpServerConfig> McpServers { get; set; }
    }
}
