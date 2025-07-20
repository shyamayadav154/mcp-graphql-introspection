# GraphQL Introspection MCP Server

A Node.js server implementing the Model Context Protocol (MCP) that provides GraphQL schema introspection capabilities. This server enables LLMs to inspect GraphQL schemas and retrieve information about available queries, mutations, and types.

## Features

- **Schema Introspection**: Query GraphQL endpoints to retrieve complete schema information
- **Query Discovery**: List all available queries with descriptions and parameters
- **Mutation Discovery**: List all available mutations with descriptions and parameters
- **Type Details**: Get detailed information about specific GraphQL types including fields, enum values, and input fields
- **Endpoint Required**: Must specify a GraphQL endpoint when starting the server

## API

### Tools

- **introspect_schema**
  - Get full GraphQL schema information from the configured endpoint
  - No input parameters required
  - Returns basic schema information including query/mutation/subscription types and counts

- **get_graphql_gql_queries**
  - List all available queries with descriptions and parameters
  - No input parameters required
  - Returns formatted list of queries with their arguments and return types

- **get_graphql_gql_mutations**
  - List all available mutations with descriptions and parameters
  - No input parameters required
  - Returns formatted list of mutations with their arguments and return types

- **get_graphql_type_details**
  - Get detailed information about specific GraphQL types
  - Input: `typeNames` (array of strings): Names of the GraphQL types to inspect
  - Returns detailed type information including fields, enum values, and input fields

## Usage

**Important**: A GraphQL endpoint is required when starting the server. The server will not start without one.

```bash
# Using --endpoint flag
npx mcp-graphql-introspection --endpoint https://api.example.com/graphql

# Using -e shorthand
npx mcp-graphql-introspection -e https://api.example.com/graphql

# Direct URL as first argument  
npx mcp-graphql-introspection https://api.example.com/graphql

# Error - no endpoint provided
npx mcp-graphql-introspection
# Error: GraphQL endpoint is required. Please provide an endpoint using --endpoint flag or as a direct URL argument.
```

### Claude code
```bash
# Must provide an endpoint
claude mcp add graphql-introspection npx mcp-graphql-introspection https://api.example.com/graphql

# Or with --endpoint flag
claude mcp add graphql-introspection npx mcp-graphql-introspection --endpoint https://api.example.com/graphql
```

### Cursor
#### Click the button to install:
[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=graphql-introspection&config=JTdCJTIyY29tbWFuZCUyMiUzQSUyMm5weCUyMG1jcC1ncmFwaHFsLWludHJvc3BlY3Rpb24lMjIlN0Q%3D)
#### Or install manually:
Go to Cursor Settings -> MCP -> Add new MCP Server. Name to your liking, use command type with the command npx mcp-graphql-introspection. You can also verify config or add command like arguments via clicking Edit.

```json
{
  "mcpServers": {
    "graphql-introspection": {
      "command": "npx",
      "args": ["mcp-graphql-introspection", "--endpoint", "https://api.example.com/graphql"]
    }
  }
}
```

#### Alternative with direct URL:
```json
{
  "mcpServers": {
    "graphql-introspection": {
      "command": "npx",
      "args": ["mcp-graphql-introspection", "https://api.example.com/graphql"]
    }
  }
}
```

### Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "graphql-introspection": {
      "command": "npx",
      "args": ["mcp-graphql-introspection", "--endpoint", "https://api.example.com/graphql"]
    }
  }
}
```

#### Alternative with direct URL:
```json
{
  "mcpServers": {
    "graphql-introspection": {
      "command": "npx",
      "args": ["mcp-graphql-introspection", "https://api.example.com/graphql"]
    }
  }
}
```

### VS Code

Add this to your VS Code settings:

```json
{
  "mcpServers": {
    "graphql-introspection": {
      "command": "npx",
      "args": ["mcp-graphql-introspection", "--endpoint", "https://api.example.com/graphql"]
    }
  }
}
```

#### Alternative with direct URL:
```json
{
  "mcpServers": {
    "graphql-introspection": {
      "command": "npx",
      "args": ["mcp-graphql-introspection", "https://api.example.com/graphql"]
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


