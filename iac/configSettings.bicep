// Configuration Settings module for FIFOWorldCup
// Manages Key Vault secrets and App Service configuration
// Based on eShop proven patterns

@description('Key Vault name')
param keyVaultName string

@description('App Service name')
param appServiceName string

@description('SQL Server FQDN')
param sqlServerFQDN string

@description('SQL Database name')
param sqlDatabaseName string

@description('SQL Admin Login')
@secure()
param sqlAdminLogin string

@description('SQL Admin Password')
@secure()
param sqlAdminPassword string

@description('Application Insights Instrumentation Key')
param appInsightsInstrumentationKey string

@description('Application Insights Connection String')
param appInsightsConnectionString string

@description('Name for SQL connection string secret in Key Vault')
param sqlConnectionStringSecretName string

@description('Name for FIFO API key secret in Key Vault')
param fifoApiKeySecretName string

// Build SQL Connection String
var sqlConnectionString = 'Server=tcp:${sqlServerFQDN},1433;Initial Catalog=${sqlDatabaseName};Persist Security Info=False;User ID=${sqlAdminLogin};Password=${sqlAdminPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'

// Reference existing Key Vault
resource existingKeyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

// Create SQL Connection String Secret
resource sqlConnectionStringSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name: sqlConnectionStringSecretName
  parent: existingKeyVault
  properties: {
    contentType: 'text/plain'
    value: sqlConnectionString
  }
}

// Create FIFO API Key Secret (placeholder)
resource fifoApiKeySecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name: fifoApiKeySecretName
  parent: existingKeyVault
  properties: {
    contentType: 'text/plain'
    value: 'YOUR-FIFO-API-KEY-HERE'
  }
}

// Base App Settings
var baseAppSettings = {
  WEBSITE_RUN_FROM_PACKAGE: '1'
  APPINSIGHTS_INSTRUMENTATIONKEY: appInsightsInstrumentationKey
  APPINSIGHTS_PROFILERFEATURE_VERSION: '1.0.0'
  APPINSIGHTS_SNAPSHOTFEATURE_VERSION: '1.0.0'
  APPLICATIONINSIGHTS_CONNECTION_STRING: appInsightsConnectionString
  ApplicationInsightsAgent_EXTENSION_VERSION: '~3'
  XDT_MicrosoftApplicationInsights_Mode: 'recommended'
}

// Production Slot Specific Settings
var productionSlotSettings = {
  ASPNETCORE_ENVIRONMENT: 'Production'
  KeyVaultName: keyVaultName
  FifoApiKey: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=${fifoApiKeySecretName})'
}

// Connection Strings using Key Vault references
var connectionStrings = {
  DefaultConnection: {
    value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=${sqlConnectionStringSecretName})'
    type: 'SQLAzure'
  }
}

// Set App Settings on App Service
resource appSettings 'Microsoft.Web/sites/config@2023-01-01' = {
  name: '${appServiceName}/appsettings'
  properties: union(baseAppSettings, productionSlotSettings)
  dependsOn: [
    sqlConnectionStringSecret
    fifoApiKeySecret
  ]
}

// Set Connection Strings on App Service
resource connectionStringsConfig 'Microsoft.Web/sites/config@2023-01-01' = {
  name: '${appServiceName}/connectionstrings'
  properties: connectionStrings
  dependsOn: [
    sqlConnectionStringSecret
  ]
}

// Outputs
output sqlConnectionStringSecretUri string = sqlConnectionStringSecret.properties.secretUri
output fifoApiKeySecretUri string = fifoApiKeySecret.properties.secretUri
