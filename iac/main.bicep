// Deploy Azure infrastructure for Gino's Gelato
// App Service (API) + Static Web App (frontend)
// Assumes resource group already exists

targetScope = 'resourceGroup'

// Parameters
@description('Azure region for all resources')
param location string = 'eastus'

// Playwright Workspaces is only available in a short list of regions (for
// example East US, West US 3, East Asia, West Europe, Australia East, Japan
// East, Switzerland North). Kept independent of 'location' so the rest of
// the stack can deploy to a region (e.g. centralus) that doesn't support it.
@description('Azure region for the Playwright Workspace (Azure App Testing). Must be a region that supports Playwright Workspaces.')
param playwrightWorkspaceLocation string = 'eastus'

@description('Created by')
param createdBy string = 'Randy Pagels'

@description('Cost center')
param costCenter string = 'GinosGelato'

@description('Azure SQL administrator login')
param sqlAdminLogin string = 'ginosadmin'

@description('Azure SQL administrator password (supply via a secret; never commit)')
@secure()
param sqlAdminPassword string

// ObjectId of user/alias that needs Key Vault access (RPagels).
// AAD object IDs are identifiers, not secrets, so hardcoding a default is fine.
// Override at deploy time (parameter/secret) for other users/environments.
@description('Azure AD Object ID for admin user - RPagels. Grants full secret access in Key Vault.')
param adminObjectId string = '0aa95253-9e37-4af9-a63a-3b35ed78e98b'

@description('AAD object ID for the deployment service principal. Optional Key Vault secret access. Empty to skip.')
param deploymentPrincipalObjectId string = ''

// Variables - Centralized resource naming
// Recommended abbreviations: https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations
var appServicePlanName = 'plan-${uniqueString(subscription().subscriptionId, resourceGroup().id)}'
var appServiceName = 'app-${uniqueString(subscription().subscriptionId, resourceGroup().id)}'
var staticWebAppName = 'swa-${uniqueString(subscription().subscriptionId, resourceGroup().id)}'
var sqlServerName = 'sql-${uniqueString(subscription().subscriptionId, resourceGroup().id)}'
var keyVaultName = 'kv-${uniqueString(subscription().subscriptionId, resourceGroup().id)}'
var databaseName = 'GinosGelatoDb'
var appInsightsName = 'appi-${uniqueString(subscription().subscriptionId, resourceGroup().id)}'
var appInsightsWorkspaceName = 'log-${uniqueString(subscription().subscriptionId, resourceGroup().id)}'
var appInsightsAlertName = 'alert-responsetime-${uniqueString(subscription().subscriptionId, resourceGroup().id)}'
// Playwright Workspace resource names must be letters/digits only (no hyphens).
var playwrightWorkspaceName = 'pww${uniqueString(subscription().subscriptionId, resourceGroup().id)}'

// Tags
var defaultTags = {
  App: 'GinosGelato'
  Environment: 'Production'
  CostCenter: costCenter
  CreatedBy: createdBy
}

// Deploy App Service Plan
module appServicePlan 'appServicePlan.bicep' = {
  name: 'appServicePlanDeployment'
  params: {
    location: location
    appServicePlanName: appServicePlanName
    defaultTags: defaultTags
  }
}

// Deploy Static Web App (needed for CORS configuration)
module staticWebApp 'staticWebApp.bicep' = {
  name: 'staticWebAppDeployment'
  params: {
    location: location
    staticWebAppName: staticWebAppName
    defaultTags: defaultTags
  }
}

// Deploy Azure SQL (system of record)
module sqlDatabase 'sqlDatabase.bicep' = {
  name: 'sqlDatabaseDeployment'
  params: {
    location: location
    sqlServerName: sqlServerName
    databaseName: databaseName
    administratorLogin: sqlAdminLogin
    administratorPassword: sqlAdminPassword
    defaultTags: defaultTags
  }
}

// Deploy App Service (creates the managed identity used for Key Vault access)
module appService 'appService.bicep' = {
  name: 'appServiceDeployment'
  params: {
    location: location
    appServiceName: appServiceName
    appServicePlanId: appServicePlan.outputs.appServicePlanId
    staticWebAppUrl: staticWebApp.outputs.staticWebAppUrl
    defaultTags: defaultTags
  }
}

// Deploy Key Vault with access policies (App Service MI + admin email)
module keyVault 'keyVault.bicep' = {
  name: 'keyVaultDeployment'
  params: {
    location: location
    keyVaultName: keyVaultName
    appServicePrincipalId: appService.outputs.appServicePrincipalId
    adminObjectId: adminObjectId
    deploymentPrincipalObjectId: deploymentPrincipalObjectId
    defaultTags: defaultTags
  }
}

// Deploy Application Insights + Log Analytics workspace and wire availability
// tests to the deployed endpoints.
module appInsights 'appInsights.bicep' = {
  name: 'appInsightsDeployment'
  params: {
    location: location
    appInsightsName: appInsightsName
    appInsightsWorkspaceName: appInsightsWorkspaceName
    appInsightsAlertName: appInsightsAlertName
    appServiceUrl: 'https://${appService.outputs.appServiceDefaultHostName}'
    staticWebAppUrl: staticWebApp.outputs.staticWebAppUrl
    defaultTags: defaultTags
  }
}

// Deploy Playwright Workspace (Azure App Testing) used to run the existing
// /e2e/ Playwright suite on managed cloud browsers at scale.
module playwrightWorkspace 'playwrightWorkspace.bicep' = {
  name: 'playwrightWorkspaceDeployment'
  params: {
    location: playwrightWorkspaceLocation
    playwrightWorkspaceName: playwrightWorkspaceName
    adminObjectId: adminObjectId
    deploymentPrincipalObjectId: deploymentPrincipalObjectId
    defaultTags: defaultTags
  }
}

// Write secrets and wire App Service settings/connection strings (reference style)
module configSettings 'configSettings.bicep' = {
  name: 'configSettingsDeployment'
  params: {
    keyVaultName: keyVault.outputs.keyVaultName
    keyVaultUri: keyVault.outputs.keyVaultUri
    appServiceName: appService.outputs.appServiceName
    sqlServerFqdn: sqlDatabase.outputs.sqlServerFqdn
    databaseName: sqlDatabase.outputs.databaseName
    administratorLogin: sqlAdminLogin
    administratorPassword: sqlAdminPassword
    staticWebAppUrl: staticWebApp.outputs.staticWebAppUrl
    appInsightsConnectionString: appInsights.outputs.appInsightsConnectionString
  }
}

// Outputs for pipeline and verification
output appServiceName string = appServiceName
output appServiceUrl string = 'https://${appService.outputs.appServiceDefaultHostName}'
output appServicePrincipalId string = appService.outputs.appServicePrincipalId
output staticWebAppName string = staticWebAppName
output staticWebAppUrl string = staticWebApp.outputs.staticWebAppUrl
output sqlServerName string = sqlDatabase.outputs.sqlServerName
output sqlServerFqdn string = sqlDatabase.outputs.sqlServerFqdn
output databaseName string = sqlDatabase.outputs.databaseName
output keyVaultName string = keyVault.outputs.keyVaultName
output appInsightsName string = appInsights.outputs.appInsightsName
output playwrightWorkspaceName string = playwrightWorkspace.outputs.playwrightWorkspaceName
output playwrightWorkspaceDashboardUri string = playwrightWorkspace.outputs.playwrightWorkspaceDashboardUri

// Client build consumes this as VITE_APPINSIGHTS_CONNECTION_STRING so browser
// telemetry lands in the same Application Insights resource as the API.
@description('Application Insights connection string for the Static Web App build.')
output appInsightsConnectionString string = appInsights.outputs.appInsightsConnectionString
