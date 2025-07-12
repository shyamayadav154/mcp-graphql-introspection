#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { GraphQLClient } from 'graphql-request';
// Default GraphQL endpoint
const DEFAULT_ENDPOINT = 'http://localhost:4001/api/graphql';
// GraphQL introspection query
const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }

  fragment InputValue on __InputValue {
    name
    description
    type { ...TypeRef }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;
// Helper function for making GraphQL requests
async function makeGraphQLRequest(endpoint, query, variables) {
    try {
        const client = new GraphQLClient(endpoint);
        const result = await client.request(query, variables);
        return { data: result, error: null };
    }
    catch (error) {
        let errorMessage = 'Unknown error occurred';
        if (error.response) {
            const status = error.response.status;
            if (status === 500) {
                errorMessage =
                    "GraphQL server error (500). The endpoint may not support introspection or there's a server issue.";
            }
            else if (status === 403) {
                errorMessage =
                    'GraphQL introspection is disabled on this endpoint (403 Forbidden).';
            }
            else if (status === 404) {
                errorMessage =
                    'GraphQL endpoint not found (404). Please check the URL.';
            }
            else {
                errorMessage = `GraphQL request failed with status ${status}`;
            }
        }
        else if (error.message) {
            errorMessage = error.message;
        }
        console.error('Error making GraphQL request:', error);
        return { data: null, error: errorMessage };
    }
}
// Helper function to format GraphQL type
function formatType(type) {
    if (type.ofType) {
        switch (type.kind) {
            case 'NON_NULL':
                return `${formatType(type.ofType)}!`;
            case 'LIST':
                return `[${formatType(type.ofType)}]`;
            default:
                return type.name || 'Unknown';
        }
    }
    return type.name || 'Unknown';
}
// Helper function to format GraphQL field
function formatField(field) {
    const args = field.args.length > 0
        ? `(${field.args.map((arg) => `${arg.name}: ${formatType(arg.type)}`).join(', ')})`
        : '';
    return [
        `${field.name}${args}: ${formatType(field.type)}`,
        field.description ? `  Description: ${field.description}` : '',
        field.isDeprecated
            ? `  DEPRECATED: ${field.deprecationReason || 'No reason given'}`
            : '',
    ]
        .filter(Boolean)
        .join('\n');
}
// Create server instance
const server = new McpServer({
    name: 'graphql-introspection',
    version: '1.0.0',
});
server.tool('introspect-schema', 'Get full GraphQL schema information from endpoint', {
    endpoint: z
        .string()
        .url()
        .optional()
        .describe('GraphQL endpoint URL (defaults to localhost:4001/api/graphql)'),
}, async ({ endpoint }) => {
    const graphqlEndpoint = endpoint || DEFAULT_ENDPOINT;
    const { data: introspectionData, error } = await makeGraphQLRequest(graphqlEndpoint, INTROSPECTION_QUERY);
    if (error || !introspectionData) {
        return {
            content: [
                {
                    type: 'text',
                    text: error || 'Failed to retrieve schema information',
                },
            ],
        };
    }
    const schema = introspectionData.__schema;
    const schemaInfo = [
        `GraphQL Schema for ${graphqlEndpoint}`,
        `Query Type: ${schema.queryType?.name || 'None'}`,
        `Mutation Type: ${schema.mutationType?.name || 'None'}`,
        `Subscription Type: ${schema.subscriptionType?.name || 'None'}`,
        `Total Types: ${schema.types.length}`,
        `Directives: ${schema.directives.length}`,
    ];
    return {
        content: [
            {
                type: 'text',
                text: schemaInfo.join('\n'),
            },
        ],
    };
});
server.tool('get-queries', 'List all available graphql/gql queries with parameters', {
    endpoint: z
        .string()
        .url()
        .optional()
        .describe('GraphQL endpoint URL (defaults to localhost:4001/api/graphql)'),
}, async ({ endpoint }) => {
    const graphqlEndpoint = endpoint || DEFAULT_ENDPOINT;
    const { data: introspectionData, error } = await makeGraphQLRequest(graphqlEndpoint, INTROSPECTION_QUERY);
    if (error || !introspectionData) {
        return {
            content: [
                {
                    type: 'text',
                    text: error || 'Failed to retrieve schema information',
                },
            ],
        };
    }
    const schema = introspectionData.__schema;
    const queryType = schema.types.find((type) => type.name === schema.queryType?.name);
    if (!queryType || !queryType.fields) {
        return {
            content: [
                {
                    type: 'text',
                    text: 'No query type found in schema',
                },
            ],
        };
    }
    const formattedQueries = queryType.fields.map(formatField);
    const queriesText = `Available Queries:\n\n${formattedQueries.join('\n\n')}`;
    return {
        content: [
            {
                type: 'text',
                text: queriesText,
            },
        ],
    };
});
server.tool('get-mutations', 'List all available graphql/gql mutations parameters', {
    endpoint: z
        .string()
        .url()
        .optional()
        .describe('GraphQL endpoint URL (defaults to localhost:4001/api/graphql)'),
}, async ({ endpoint }) => {
    const graphqlEndpoint = endpoint || DEFAULT_ENDPOINT;
    const { data: introspectionData, error } = await makeGraphQLRequest(graphqlEndpoint, INTROSPECTION_QUERY);
    if (error || !introspectionData) {
        return {
            content: [
                {
                    type: 'text',
                    text: error || 'Failed to retrieve schema information',
                },
            ],
        };
    }
    const schema = introspectionData.__schema;
    const mutationType = schema.types.find((type) => type.name === schema.mutationType?.name);
    if (!mutationType || !mutationType.fields) {
        return {
            content: [
                {
                    type: 'text',
                    text: 'No mutation type found in schema',
                },
            ],
        };
    }
    const formattedMutations = mutationType.fields.map(formatField);
    const mutationsText = `Available Mutations:\n\n${formattedMutations.join('\n\n')}`;
    return {
        content: [
            {
                type: 'text',
                text: mutationsText,
            },
        ],
    };
});
server.tool('get-type-details', 'Get detailed information about specific GraphQL/gql types', {
    endpoint: z
        .string()
        .url()
        .optional()
        .describe('GraphQL endpoint URL (defaults to localhost:4001/api/graphql)'),
    typeNames: z.array(z.string()).describe('Names of the GraphQL types to inspect'),
}, async ({ endpoint, typeNames }) => {
    const graphqlEndpoint = endpoint || DEFAULT_ENDPOINT;
    const { data: introspectionData, error } = await makeGraphQLRequest(graphqlEndpoint, INTROSPECTION_QUERY);
    if (error || !introspectionData) {
        return {
            content: [
                {
                    type: 'text',
                    text: error || 'Failed to retrieve schema information',
                },
            ],
        };
    }
    const schema = introspectionData.__schema;
    const foundTypes = [];
    const notFoundTypes = [];
    for (const typeName of typeNames) {
        const type = schema.types.find((t) => t.name === typeName);
        if (type) {
            foundTypes.push(type);
        }
        else {
            notFoundTypes.push(typeName);
        }
    }
    const result = [];
    if (notFoundTypes.length > 0) {
        result.push(`Types not found: ${notFoundTypes.join(', ')}`);
    }
    for (const type of foundTypes) {
        const typeDetails = [
            `Type: ${type.name}`,
            `Kind: ${type.kind}`,
            type.description ? `Description: ${type.description}` : '',
        ].filter(Boolean);
        if (type.fields) {
            typeDetails.push(`\nFields:`);
            type.fields.forEach((field) => {
                typeDetails.push(`  ${formatField(field)}`);
            });
        }
        if (type.enumValues) {
            typeDetails.push(`\nEnum Values:`);
            type.enumValues.forEach((value) => {
                typeDetails.push(`  ${value.name}${value.description ? ` - ${value.description}` : ''}`);
            });
        }
        if (type.inputFields) {
            typeDetails.push(`\nInput Fields:`);
            type.inputFields.forEach((field) => {
                typeDetails.push(`  ${field.name}: ${formatType(field.type)}${field.description ? ` - ${field.description}` : ''}`);
            });
        }
        result.push(typeDetails.join('\n'));
    }
    return {
        content: [
            {
                type: 'text',
                text: result.join('\n\n---\n\n'),
            },
        ],
    };
});
// doesn't work because no session
// server.tool(
//     'run-query',
//     'Execute a GraphQL query on the endpoint',
//     {
//         endpoint: z
//             .string()
//             .url()
//             .optional()
//             .describe(
//                 'GraphQL endpoint URL (defaults to localhost:4001/api/graphql)',
//             ),
//         query: z.string().describe('GraphQL query to execute'),
//         variables: z
//             .record(z.any())
//             .optional()
//             .describe('Variables for the GraphQL query (as JSON object)'),
//     },
//     async ({ endpoint, query, variables }) => {
//         const graphqlEndpoint = endpoint || DEFAULT_ENDPOINT
//         const { data: queryResult, error } = await makeGraphQLRequest<any>(
//             graphqlEndpoint,
//             query,
//             variables,
//         )
//
//         if (error) {
//             return {
//                 content: [
//                     {
//                         type: 'text',
//                         text: `Query execution failed: ${error}`,
//                     },
//                 ],
//             }
//         }
//
//         if (!queryResult) {
//             return {
//                 content: [
//                     {
//                         type: 'text',
//                         text: 'Query executed but returned no data',
//                     },
//                 ],
//             }
//         }
//
//         try {
//             const formattedResult = JSON.stringify(queryResult, null, 2)
//             return {
//                 content: [
//                     {
//                         type: 'text',
//                         text: `Query Result:\n\n${formattedResult}`,
//                     },
//                 ],
//             }
//         } catch (jsonError) {
//             return {
//                 content: [
//                     {
//                         type: 'text',
//                         text: `Query executed successfully but result could not be formatted: ${String(queryResult)}`,
//                     },
//                 ],
//             }
//         }
//     },
// )
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('GraphQL Introspection MCP Server running on stdio');
}
main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
