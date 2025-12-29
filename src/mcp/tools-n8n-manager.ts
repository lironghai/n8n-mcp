import { ToolDefinition } from '../types';

/**
 * n8n Management Tools
 * 
 * These tools enable AI agents to manage n8n workflows through the n8n API.
 * They require N8N_API_URL and N8N_API_KEY to be configured.
 */
export const n8nManagementTools: ToolDefinition[] = [
  // Workflow Management Tools
  {
    name: 'n8n_create_workflow',
    description: `Create workflow. Requires: name, nodes[], connections{}. Created inactive. Returns workflow with ID.`,
    inputSchema: {
      type: 'object',
      properties: {
        name: { 
          type: 'string', 
          description: 'Workflow name (required)' 
        },
        nodes: { 
          type: 'array', 
          description: 'Array of workflow nodes. Each node must have: id, name, type, typeVersion, position, and parameters',
          items: {
            type: 'object',
            required: ['id', 'name', 'type', 'typeVersion', 'position', 'parameters'],
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              typeVersion: { type: 'number' },
              position: { 
                type: 'array',
                items: { type: 'number' },
                minItems: 2,
                maxItems: 2
              },
              parameters: { type: 'object' },
              credentials: { type: 'object' },
              disabled: { type: 'boolean' },
              notes: { type: 'string' },
              continueOnFail: { type: 'boolean' },
              retryOnFail: { type: 'boolean' },
              maxTries: { type: 'number' },
              waitBetweenTries: { type: 'number' }
            }
          }
        },
        connections: {
          type: 'object',
          description: 'Workflow connections object. Keys are source node names (the name field, not id), values define output connections'
        },
        settings: {
          type: 'object',
          description: 'Optional workflow settings (execution order, timezone, error handling)',
          properties: {
            executionOrder: { type: 'string', enum: ['v0', 'v1'] },
            timezone: { type: 'string' },
            saveDataErrorExecution: { type: 'string', enum: ['all', 'none'] },
            saveDataSuccessExecution: { type: 'string', enum: ['all', 'none'] },
            saveManualExecutions: { type: 'boolean' },
            saveExecutionProgress: { type: 'boolean' },
            executionTimeout: { type: 'number' },
            errorWorkflow: { type: 'string' }
          }
        }
      },
      required: ['name', 'nodes', 'connections']
    }
  },
  {
    name: 'n8n_get_workflow',
    description: `Get workflow by ID with different detail levels. Use mode='full' for complete workflow, 'details' for metadata+stats, 'structure' for nodes/connections only, 'minimal' for id/name/active/tags.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Workflow ID'
        },
        mode: {
          type: 'string',
          enum: ['full', 'details', 'structure', 'minimal'],
          default: 'full',
          description: 'Detail level: full=complete workflow, details=full+execution stats, structure=nodes/connections topology, minimal=metadata only'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'n8n_update_full_workflow',
    description: `Full workflow update. Requires complete nodes[] and connections{}. For incremental use n8n_update_partial_workflow.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: { 
          type: 'string', 
          description: 'Workflow ID to update' 
        },
        name: { 
          type: 'string', 
          description: 'New workflow name' 
        },
        nodes: { 
          type: 'array', 
          description: 'Complete array of workflow nodes (required if modifying workflow structure)',
          items: {
            type: 'object',
            additionalProperties: true
          }
        },
        connections: { 
          type: 'object', 
          description: 'Complete connections object (required if modifying workflow structure)' 
        },
        settings: { 
          type: 'object', 
          description: 'Workflow settings to update' 
        }
      },
      required: ['id']
    }
  },
  {
    name: 'n8n_update_partial_workflow',
    description: `Update workflow incrementally with diff operations. Types: addNode, removeNode, updateNode, moveNode, enable/disableNode, addConnection, removeConnection, updateSettings, updateName, add/removeTag. See tools_documentation("n8n_update_partial_workflow", "full") for details.`,
    inputSchema: {
      type: 'object',
      additionalProperties: true,  // Allow any extra properties Claude Desktop might add
      properties: {
        id: { 
          type: 'string', 
          description: 'Workflow ID to update' 
        },
        operations: {
          type: 'array',
          description: 'Array of diff operations to apply. Each operation must have a "type" field and relevant properties for that operation type.',
          items: {
            type: 'object',
            additionalProperties: true
          }
        },
        validateOnly: {
          type: 'boolean',
          description: 'If true, only validate operations without applying them'
        },
        continueOnError: {
          type: 'boolean',
          description: 'If true, apply valid operations even if some fail (best-effort mode). Returns applied and failed operation indices. Default: false (atomic)'
        }
      },
      required: ['id', 'operations']
    }
  },
  {
    name: 'n8n_delete_workflow',
    description: `Permanently delete a workflow. This action cannot be undone.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: { 
          type: 'string', 
          description: 'Workflow ID to delete' 
        }
      },
      required: ['id']
    }
  },
  {
    name: 'n8n_activate_workflow',
    description: `Activate a workflow to enable automatic execution. Workflow must have at least one enabled trigger node.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Workflow ID to activate'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'n8n_deactivate_workflow',
    description: `Deactivate a workflow to prevent automatic execution. The workflow can still be executed manually.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Workflow ID to deactivate'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'n8n_list_workflows',
    description: `List workflows (minimal metadata only). Returns id/name/active/dates/tags. Check hasMore/nextCursor for pagination.`,
    inputSchema: {
      type: 'object',
      properties: {
        limit: { 
          type: 'number', 
          description: 'Number of workflows to return (1-100, default: 100)' 
        },
        cursor: { 
          type: 'string', 
          description: 'Pagination cursor from previous response' 
        },
        active: { 
          type: 'boolean', 
          description: 'Filter by active status' 
        },
        tags: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Filter by tags (exact match)' 
        },
        projectId: { 
          type: 'string', 
          description: 'Filter by project ID (enterprise feature)' 
        },
        excludePinnedData: { 
          type: 'boolean', 
          description: 'Exclude pinned data from response (default: true)' 
        }
      }
    }
  },
  {
    name: 'n8n_validate_workflow',
    description: `Validate workflow by ID. Checks nodes, connections, expressions. Returns errors/warnings/suggestions.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: { 
          type: 'string', 
          description: 'Workflow ID to validate' 
        },
        options: {
          type: 'object',
          description: 'Validation options',
          properties: {
            validateNodes: { 
              type: 'boolean', 
              description: 'Validate node configurations (default: true)' 
            },
            validateConnections: { 
              type: 'boolean', 
              description: 'Validate workflow connections (default: true)' 
            },
            validateExpressions: { 
              type: 'boolean', 
              description: 'Validate n8n expressions (default: true)' 
            },
            profile: { 
              type: 'string', 
              enum: ['minimal', 'runtime', 'ai-friendly', 'strict'],
              description: 'Validation profile to use (default: runtime)' 
            }
          }
        }
      },
      required: ['id']
    }
  },
  {
    name: 'n8n_autofix_workflow',
    description: `Automatically fix common workflow validation errors. Preview fixes or apply them. Fixes expression format, typeVersion, error output config, webhook paths.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Workflow ID to fix'
        },
        applyFixes: {
          type: 'boolean',
          description: 'Apply fixes to workflow (default: false - preview mode)'
        },
        fixTypes: {
          type: 'array',
          description: 'Types of fixes to apply (default: all)',
          items: {
            type: 'string',
            enum: ['expression-format', 'typeversion-correction', 'error-output-config', 'node-type-correction', 'webhook-missing-path', 'typeversion-upgrade', 'version-migration']
          }
        },
        confidenceThreshold: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
          description: 'Minimum confidence level for fixes (default: medium)'
        },
        maxFixes: {
          type: 'number',
          description: 'Maximum number of fixes to apply (default: 50)'
        }
      },
      required: ['id']
    }
  },

  // Execution Management Tools
  {
    name: 'n8n_test_workflow',
    description: `Test/trigger workflow execution. Auto-detects trigger type (webhook/form/chat). Supports: webhook (HTTP), form (fields), chat (message). Note: Only workflows with these trigger types can be executed externally.`,
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'Workflow ID to execute (required)'
        },
        triggerType: {
          type: 'string',
          enum: ['webhook', 'form', 'chat'],
          description: 'Trigger type. Auto-detected if not specified. Workflow must have a matching trigger node.'
        },
        // Webhook options
        httpMethod: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE'],
          description: 'For webhook: HTTP method (default: from workflow config or POST)'
        },
        webhookPath: {
          type: 'string',
          description: 'For webhook: override the webhook path'
        },
        // Chat options
        message: {
          type: 'string',
          description: 'For chat: message to send (required for chat triggers)'
        },
        sessionId: {
          type: 'string',
          description: 'For chat: session ID for conversation continuity'
        },
        // Common options
        data: {
          type: 'object',
          description: 'Input data/payload for webhook, form fields, or execution data'
        },
        headers: {
          type: 'object',
          description: 'Custom HTTP headers'
        },
        timeout: {
          type: 'number',
          description: 'Timeout in ms (default: 120000)'
        },
        waitForResponse: {
          type: 'boolean',
          description: 'Wait for workflow completion (default: true)'
        }
      },
      required: ['workflowId']
    }
  },
  {
    name: 'n8n_executions',
    description: `Manage workflow executions: get details, list, or delete. Use action='get' with id for execution details, action='list' for listing executions, action='delete' to remove execution record.`,
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['get', 'list', 'delete'],
          description: 'Operation: get=get execution details, list=list executions, delete=delete execution'
        },
        // For action='get' and action='delete'
        id: {
          type: 'string',
          description: 'Execution ID (required for action=get or action=delete)'
        },
        // For action='get' - detail level
        mode: {
          type: 'string',
          enum: ['preview', 'summary', 'filtered', 'full', 'error'],
          description: 'For action=get: preview=structure only, summary=2 items (default), filtered=custom, full=all data, error=optimized error debugging'
        },
        nodeNames: {
          type: 'array',
          items: { type: 'string' },
          description: 'For action=get with mode=filtered: filter to specific nodes by name'
        },
        itemsLimit: {
          type: 'number',
          description: 'For action=get with mode=filtered: items per node (0=structure, 2=default, -1=unlimited)'
        },
        includeInputData: {
          type: 'boolean',
          description: 'For action=get: include input data in addition to output (default: false)'
        },
        // Error mode specific parameters
        errorItemsLimit: {
          type: 'number',
          description: 'For action=get with mode=error: sample items from upstream node (default: 2, max: 100)'
        },
        includeStackTrace: {
          type: 'boolean',
          description: 'For action=get with mode=error: include full stack trace (default: false, shows truncated)'
        },
        includeExecutionPath: {
          type: 'boolean',
          description: 'For action=get with mode=error: include execution path leading to error (default: true)'
        },
        fetchWorkflow: {
          type: 'boolean',
          description: 'For action=get with mode=error: fetch workflow for accurate upstream detection (default: true)'
        },
        // For action='list'
        limit: {
          type: 'number',
          description: 'For action=list: number of executions to return (1-100, default: 100)'
        },
        cursor: {
          type: 'string',
          description: 'For action=list: pagination cursor from previous response'
        },
        workflowId: {
          type: 'string',
          description: 'For action=list: filter by workflow ID'
        },
        projectId: {
          type: 'string',
          description: 'For action=list: filter by project ID (enterprise feature)'
        },
        status: {
          type: 'string',
          enum: ['success', 'error', 'waiting'],
          description: 'For action=list: filter by execution status'
        },
        includeData: {
          type: 'boolean',
          description: 'For action=list: include execution data (default: false)'
        }
      },
      required: ['action']
    }
  },
  {
    name: 'n8n_retry_execution',
    description: `Retry a failed execution with the same input data. Uses n8n API's retry endpoint to re-run the workflow.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Execution ID to retry'
        },
        loadWorkflow: {
          type: 'boolean',
          description: 'Whether to load the workflow definition (default: true)'
        }
      },
      required: ['id']
    }
  },

  // System Tools
  {
    name: 'n8n_health_check',
    description: `Check n8n instance health and API connectivity. Use mode='diagnostic' for detailed troubleshooting with env vars and tool status.`,
    inputSchema: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['status', 'diagnostic'],
          description: 'Mode: "status" (default) for quick health check, "diagnostic" for detailed debug info including env vars and tool status',
          default: 'status'
        },
        verbose: {
          type: 'boolean',
          description: 'Include extra details in diagnostic mode (default: false)'
        }
      }
    }
  },
  {
    name: 'n8n_workflow_versions',
    description: `Manage workflow version history, rollback, and cleanup. Six modes:
- list: Show version history for a workflow
- get: Get details of specific version
- rollback: Restore workflow to previous version (creates backup first)
- delete: Delete specific version or all versions for a workflow
- prune: Manually trigger pruning to keep N most recent versions
- truncate: Delete ALL versions for ALL workflows (requires confirmation)`,
    inputSchema: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['list', 'get', 'rollback', 'delete', 'prune', 'truncate'],
          description: 'Operation mode'
        },
        workflowId: {
          type: 'string',
          description: 'Workflow ID (required for list, rollback, delete, prune)'
        },
        versionId: {
          type: 'number',
          description: 'Version ID (required for get mode and single version delete, optional for rollback)'
        },
        limit: {
          type: 'number',
          default: 10,
          description: 'Max versions to return in list mode'
        },
        validateBefore: {
          type: 'boolean',
          default: true,
          description: 'Validate workflow structure before rollback'
        },
        deleteAll: {
          type: 'boolean',
          default: false,
          description: 'Delete all versions for workflow (delete mode only)'
        },
        maxVersions: {
          type: 'number',
          default: 10,
          description: 'Keep N most recent versions (prune mode only)'
        },
        confirmTruncate: {
          type: 'boolean',
          default: false,
          description: 'REQUIRED: Must be true to truncate all versions (truncate mode only)'
        }
      },
      required: ['mode']
    }
  },

  // Template Deployment Tool
  {
    name: 'n8n_deploy_template',
    description: `Deploy a workflow template from n8n.io directly to your n8n instance. Deploys first, then auto-fixes common issues (expression format, typeVersions). Returns workflow ID, required credentials, and fixes applied.`,
    inputSchema: {
      type: 'object',
      properties: {
        templateId: {
          type: 'number',
          description: 'Template ID from n8n.io (required)'
        },
        name: {
          type: 'string',
          description: 'Custom workflow name (default: template name)'
        },
        autoUpgradeVersions: {
          type: 'boolean',
          default: true,
          description: 'Automatically upgrade node typeVersions to latest supported (default: true)'
        },
        autoFix: {
          type: 'boolean',
          default: true,
          description: 'Auto-apply fixes after deployment for expression format issues, missing = prefix, etc. (default: true)'
        },
        stripCredentials: {
          type: 'boolean',
          default: true,
          description: 'Remove credential references from nodes - user configures in n8n UI (default: true)'
        }
      },
      required: ['templateId']
    }
  },
    // Credential Management Tools
    {
        name: 'n8n_create_credential',
        description: `Create a new credential. WARNING: Handle credential data securely. The API returns metadata only, not the credential secrets.`,
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Credential name (must be unique)'
                },
                type: {
                    type: 'string',
                    description: 'Credential type (e.g., "httpBasicAuth", "gmailOAuth2Api"). Use n8n_get_credential_schema to see available fields.'
                },
                data: {
                    type: 'object',
                    description: 'Credential data object with type-specific fields. Structure varies by credential type.'
                }
            },
            required: ['name', 'type', 'data']
        }
    },
    {
        name: 'n8n_get_credential',
        description: `Get credential metadata. NOTE: Does NOT return sensitive credential data (passwords, tokens). Only returns id, name, type, timestamps.`,
        inputSchema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'Credential ID'
                }
            },
            required: ['id']
        }
    },
    {
        name: 'n8n_delete_credential',
        description: `Delete a credential. WARNING: This will break workflows using this credential. Use with caution.`,
        inputSchema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'Credential ID to delete'
                }
            },
            required: ['id']
        }
    },
    {
        name: 'n8n_get_credential_schema',
        description: `Get the schema for a credential type. Shows which fields are required and their types. Useful for building credential creation forms.`,
        inputSchema: {
            type: 'object',
            properties: {
                credentialTypeName: {
                    type: 'string',
                    description: 'Credential type name (e.g., "httpBasicAuth", "gmailOAuth2Api", "slackOAuth2Api")'
                }
            },
            required: ['credentialTypeName']
        }
    },

    // Tag Management Tools
    {
        name: 'n8n_create_tag',
        description: 'Create a new tag for organizing workflows.',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Tag name (must be unique)',
                },
            },
            required: ['name'],
        },
    },
    {
        name: 'n8n_list_tags',
        description: 'List all available tags with workflow counts.',
        inputSchema: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
    {
        name: 'n8n_get_tag',
        description: 'Get details about a specific tag including workflows using it.',
        inputSchema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'Tag ID',
                },
            },
            required: ['id'],
        },
    },
    {
        name: 'n8n_update_tag',
        description: 'Update tag name. Changes apply to all workflows using this tag.',
        inputSchema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'Tag ID',
                },
                name: {
                    type: 'string',
                    description: 'New tag name',
                },
            },
            required: ['id', 'name'],
        },
    },
    {
        name: 'n8n_delete_tag',
        description: 'Delete a tag. Removes tag from all workflows but does not delete the workflows.',
        inputSchema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'Tag ID to delete',
                },
            },
            required: ['id'],
        },
    },
    {
        name: 'n8n_update_workflow_tags',
        description: 'Set tags for a workflow. Replaces all existing tags with the provided list.',
        inputSchema: {
            type: 'object',
            properties: {
                workflowId: {
                    type: 'string',
                    description: 'Workflow ID',
                },
                tagIds: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                    description: 'Array of tag IDs to assign to the workflow. Pass empty array to remove all tags.',
                },
            },
            required: ['workflowId', 'tagIds'],
        },
    },

    // Variable Management Tools
    {
        name: 'n8n_create_variable',
        description: 'Create a new variable in your n8n instance. Variables store reusable data across workflows.',
        inputSchema: {
            type: 'object',
            properties: {
                key: {
                    type: 'string',
                    description: 'Variable key/name (must be unique)',
                },
                value: {
                    type: 'string',
                    description: 'Variable value',
                },
                projectId: {
                    type: 'string',
                    description: 'Optional project ID (enterprise feature)',
                },
            },
            required: ['key', 'value'],
        },
    },
    {
        name: 'n8n_list_variables',
        description: 'List all variables with optional filtering. Supports pagination for large sets.',
        inputSchema: {
            type: 'object',
            properties: {
                limit: {
                    type: 'number',
                    description: 'Number of variables to return (1-100, default: 100)',
                },
                cursor: {
                    type: 'string',
                    description: 'Pagination cursor from previous response',
                },
                projectId: {
                    type: 'string',
                    description: 'Filter by project ID (enterprise feature)',
                },
                state: {
                    type: 'string',
                    enum: ['active', 'inactive'],
                    description: 'Filter by state',
                },
            },
        },
    },
    {
        name: 'n8n_get_variable',
        description: 'Get a specific variable by ID. Returns key, value, and metadata.',
        inputSchema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'Variable ID',
                },
            },
            required: ['id'],
        },
    },
    {
        name: 'n8n_update_variable',
        description: 'Update a variable\'s key and/or value. Workflows using this variable will use the updated value.',
        inputSchema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'Variable ID to update',
                },
                key: {
                    type: 'string',
                    description: 'New variable key (optional)',
                },
                value: {
                    type: 'string',
                    description: 'New variable value (optional)',
                },
            },
            required: ['id'],
        },
    },
    {
        name: 'n8n_delete_variable',
        description: 'Delete a variable. WARNING: Workflows using this variable may fail if not updated.',
        inputSchema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'Variable ID to delete',
                },
            },
            required: ['id'],
        },
    }
];