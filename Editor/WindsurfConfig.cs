using System;
using System.Collections.Generic;

namespace GauntletRunner2025.UgsCliMcp.Editor
{
    [Serializable]
    internal class WindsurfConfig
    {
        [Serializable]
        public class McpServer
        {
            public string command;
            public string[] args;
        }

        public Dictionary<string, McpServer> mcpServers;
    }
}