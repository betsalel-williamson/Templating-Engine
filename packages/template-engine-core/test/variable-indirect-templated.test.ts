import { describe, it, expect } from 'vitest';
import { DataContext, DataContextValue } from '../src/types.js';
import { createTestEvaluator } from './test-helper.js';

describe('Story 16: Templated Indirect Variables', () => {
  const evaluate = createTestEvaluator();

  it('should evaluate the K8s ConfigMap recipe correctly for "prod" env', async () => {
    const template = `# Generated Kubernetes ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: <#appName#>-config-<#env#>
data:
  # The template uses a single 'env' variable to select the correct values.
  DB_HOST: "<##<#env#>-db-host##>"
  DB_USER: "<#db-user#>" # This value is shared across all environments
  API_URL: "<##<#env#>-api-url##>"
  LOG_LEVEL: "<##<#env#>-log-level##>"
  FEATURE_FLAG_X: "<##<#env#>-feature-flag-x##>"`;

    const data: DataContext = new Map<string, DataContextValue>([
      ['appName', 'auth-service'],
      ['db-user', 'auth_user'],
      ['env', 'prod'],
      ['dev-db-host', 'dev-postgres.local'],
      ['dev-api-url', 'http://localhost:8080/api'],
      ['dev-log-level', 'debug'],
      ['dev-feature-flag-x', '0'],
      ['staging-db-host', 'stg-db-cluster.aws.internal'],
      ['staging-api-url', 'https://api.staging.myapp.com'],
      ['staging-log-level', 'info'],
      ['staging-feature-flag-x', '0'],
      ['prod-db-host', 'prod-db-cluster.aws.internal'],
      ['prod-api-url', 'https://api.myapp.com'],
      ['prod-log-level', 'warn'],
      ['prod-feature-flag-x', '1'],
    ]);

    const expected = `# Generated Kubernetes ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: auth-service-config-prod
data:
  # The template uses a single 'env' variable to select the correct values.
  DB_HOST: "prod-db-cluster.aws.internal"
  DB_USER: "auth_user" # This value is shared across all environments
  API_URL: "https://api.myapp.com"
  LOG_LEVEL: "warn"
  FEATURE_FLAG_X: "1"`;

    const result = await evaluate(template, data);
    expect(result).toBe(expected);
  });
});
