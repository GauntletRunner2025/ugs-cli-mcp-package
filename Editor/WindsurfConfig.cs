using System;
using System.Collections.Generic;

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