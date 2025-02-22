# MCP Server Package for Unity Gaming Services CLI

This package contains an MCP server designed to give Cascade access to the Unity Gaming Services CLI as tool use.  
After installing this package, Windsurf IDE, in the Cascade chat (agent mode), will be able to take any action supported by the UGS CLI.

## Installation

### Step 1
In Unity, open the **Package Manager**, click the **Add Package** dropdown, select **"Install package from git URL"**, and paste in:
https://github.com/GauntletRunner2025/ugs-cli-mcp-core-package.git

### Step 2
If the package imports successfully, use the dropdown under **Tools** to **"Configure MCP server"**.  
- If you have no MCP config file, this package will create one.  
- If one already exists, it will attempt to add to it.  

### Step 3
In the **MCP server window** in Windsurf (the hammer icon), click **Refresh** and verify that the `ugs-cli-mcp` server is found and providing some number of tools.

---

## Supported Features

This package starts with a small number of **UGS commands**, with more being added as they are tested.

### **Player Accounts**
- `create-player`
- `delete-player`
- `disable-player`
- `enable-player`
- `get-player`
- `list-player`

### **Cloud Save**
- `list-custom-data-ids`
- `create-custom-index`
