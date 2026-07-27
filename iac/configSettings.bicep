// Configuration Settings module for Gino's Gelato
// Writes the SQL connection string secret into Key Vault and configures the
// App Service to read it via a Key Vault reference. Runs after the App Service
// and Key Vault exist so there is no circular dependency.

@description('Key Vault name')
param keyVaultName string

@description('App Service name')
param appServiceName string

@description('Key Vault URI')
param keyVaultUri string

@description('Fully qualified domain name of the SQL server')
param sqlServerFqdn string

@description('SQL database name')
param databaseName string

@description('SQL administrator login')
@secure()
param administratorLogin string

@description('SQL administrator password')
@secure()
param administratorPassword string

@description('Static Web App URL (for reference/CORS documentation)')
param staticWebAppUrl string = ''

// Secret name uses '--' which maps to the ':' config separator, becoming
// ConnectionStrings:DefaultConnection when read from Key Vault.
var connectionSecretName = 'ConnectionStrings--DefaultConnection'

var sqlConnectionString = 'Server=tcp:${sqlServerFqdn},1433;Initial Catalog=${databaseName};Persist Security Info=False;User ID=${administratorLogin};Password=${administratorPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'

// Reference the existing Key Vault
resource existingKeyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

// Create/update the SQL connection string secret (idempotent on redeploy)
resource sqlConnectionSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name: connectionSecretName
  parent: existingKeyVault
  properties: {
    contentType: 'text/plain'
    value: sqlConnectionString
  }
}

// App settings (this replaces the app settings collection)
var appSettings = {
  ASPNETCORE_ENVIRONMENT: 'Production'
  WEBSITE_RUN_FROM_PACKAGE: '1'
  KeyVaultName: keyVaultName
  KeyVault__Uri: keyVaultUri
  StaticWebAppUrl: staticWebAppUrl
}

// Connection string resolved from Key Vault at runtime via managed identity.
var connectionStrings = {
  DefaultConnection: {
    value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=${connectionSecretName})'
    type: 'SQLAzure'
  }
}

resource appSettingsConfig 'Microsoft.Web/sites/config@2023-12-01' = {
  name: '${appServiceName}/appsettings'
  properties: appSettings
  dependsOn: [
    sqlConnectionSecret
  ]
}

resource connectionStringsConfig 'Microsoft.Web/sites/config@2023-12-01' = {
  name: '${appServiceName}/connectionstrings'
  properties: connectionStrings
  dependsOn: [
    sqlConnectionSecret
  ]
}

output connectionSecretUri string = sqlConnectionSecret.properties.secretUri
