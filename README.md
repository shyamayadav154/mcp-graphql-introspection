# GraphQL Introspection MCP Server

A Node.js server implementing the Model Context Protocol (MCP) that provides GraphQL schema introspection capabilities. This server enables LLMs to inspect GraphQL schemas and retrieve information about available queries, mutations, and types.

## Features

- **Schema Introspection**: Query GraphQL endpoints to retrieve complete schema information
- **Query Discovery**: List all available queries with descriptions and parameters
- **Mutation Discovery**: List all available mutations with descriptions and parameters
- **Type Details**: Get detailed information about specific GraphQL types including fields, enum values, and input fields
- **Flexible Endpoint Support**: Connect to any GraphQL endpoint (defaults to localhost:4001/api/graphql)

## API

### Tools

- **get-queries**
  - List all available queries with descriptions and parameters
  - Input: `endpoint` (string, optional): GraphQL endpoint URL (defaults to localhost:4001/api/graphql)
  - Returns formatted list of queries with their arguments and return types

- **get-mutations**
  - List all available mutations with descriptions and parameters
  - Input: `endpoint` (string, optional): GraphQL endpoint URL (defaults to localhost:4001/api/graphql)
  - Returns formatted list of mutations with their arguments and return types

- **get-type-details**
  - Get detailed information about a specific GraphQL type
  - Input: `endpoint` (string, optional): GraphQL endpoint URL (defaults to localhost:4001/api/graphql)
  - Input: `typeName` (string): Name of the GraphQL type to inspect
  - Returns detailed type information including fields, enum values, and input fields

## Usage

### Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "graphql-introspection": {
      "command": "npx",
      "args": ["mcp-graphql-introspection"]
    }
  }
}
```

### VS Code

#### NPX Installation

Add this to your VS Code settings:

```json
{
  "mcp.servers": {
    "graphql-introspection": {
      "command": "npx",
      "args": ["mcp-graphql-introspection"]
    }
  }
}
```

## Build

```bash
npm install
npm run build
```

## License

This MCP server is licensed under the MIT License. This allows you to freely use, modify, and distribute the software.


