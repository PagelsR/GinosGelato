// Azure App Testing - Playwright Workspace for Gino's Gelato
// Provisions a Playwright Workspace (Microsoft.AzurePlaywrightService/accounts)
// used to run the existing /e2e/ Playwright suite on managed cloud browsers at
// scale, with built-in reporting (traces, screenshots, recordings, Live View).
//
// Regional availability is limited (e.g. East US, West US 3, East Asia, West
// Europe, Australia East, Japan East, Switzerland North). This module is
// intentionally deployed to its own location, independent of the main
// resource group's region, since not every region supports this resource type.

@description('Location for the Playwright Workspace (must be a region that supports Playwright Workspaces)')
param location string

@description('Name for the Playwright Workspace account')
param playwrightWorkspaceName string

@description('AAD object ID for the admin user (your email account). Grants Playwright Workspace Contributor. Empty to skip.')
param adminObjectId string = ''

@description('AAD object ID for the GitHub Actions / deployment service principal. Grants Playwright Workspace Contributor so CI can authenticate with DefaultAzureCredential. Empty to skip.')
param deploymentPrincipalObjectId string = ''

// Assigning roles requires Microsoft.Authorization/roleAssignments/write,
// which comes with Owner or User Access Administrator - not Contributor.
// Most CI service principals are (correctly, least-privilege) Contributor
// only, so this defaults to false to avoid failing the deployment. Set to
// true only if the identity running this deployment has been granted one of
// those elevated roles; otherwise grant access manually (see
// iac/playwrightWorkspace.bicep comments / the Playwright Demo Runbook) with:
//   az role assignment create --assignee <objectId> --role "Playwright Workspace Contributor" --scope <workspaceResourceId>
@description('Whether to have this deployment assign Playwright Workspace Contributor roles. Requires the deploying identity to have Owner or User Access Administrator. Defaults to false (assign access manually instead).')
param assignWorkspaceRoles bool = false

@description('Resource tags')
param defaultTags object

// Built-in "Playwright Workspace Contributor" role: manage access tokens and
// run Playwright tests against the workspace (no RBAC assignment rights).
var playwrightWorkspaceContributorRoleId = '78cf819f-0969-4ebe-8759-015c6efcd5bf'

resource playwrightWorkspace 'Microsoft.AzurePlaywrightService/accounts@2024-12-01' = {
  name: playwrightWorkspaceName
  location: location
  tags: defaultTags
  properties: {
    // Local auth (access tokens) disabled - CI and local `az login` both
    // authenticate via Entra ID / DefaultAzureCredential instead.
    localAuth: 'Disabled'
    regionalAffinity: 'Enabled'
    reporting: 'Enabled'
    scalableExecution: 'Enabled'
  }
}

// Optional admin (your email) access for local `az login` demo prep.
resource adminRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(adminObjectId) && assignWorkspaceRoles) {
  name: guid(playwrightWorkspace.id, adminObjectId, playwrightWorkspaceContributorRoleId)
  scope: playwrightWorkspace
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', playwrightWorkspaceContributorRoleId)
    principalId: adminObjectId
    principalType: 'User'
  }
}

// Optional deployment/CI service principal access so GitHub Actions can run
// tests against the workspace without a manually issued access token.
resource deploymentRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(deploymentPrincipalObjectId) && assignWorkspaceRoles) {
  name: guid(playwrightWorkspace.id, deploymentPrincipalObjectId, playwrightWorkspaceContributorRoleId)
  scope: playwrightWorkspace
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', playwrightWorkspaceContributorRoleId)
    principalId: deploymentPrincipalObjectId
    principalType: 'ServicePrincipal'
  }
}

output playwrightWorkspaceName string = playwrightWorkspace.name
output playwrightWorkspaceId string = playwrightWorkspace.id
output playwrightWorkspaceDashboardUri string = playwrightWorkspace.properties.dashboardUri
