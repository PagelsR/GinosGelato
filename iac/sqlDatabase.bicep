// Azure SQL module for Gino's Gelato
// System of record for orders. Credentials are never emitted as outputs;
// the connection string is composed inside the Key Vault module and stored as a secret.

@description('Location for the SQL resources')
param location string = 'eastus'

@description('Name for the logical SQL server')
param sqlServerName string

@description('Name for the SQL database')
param databaseName string = 'GinosGelatoDb'

@description('SQL administrator login')
param administratorLogin string

@description('SQL administrator password')
@secure()
param administratorPassword string

@description('Resource tags')
param defaultTags object

resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: sqlServerName
  location: location
  tags: defaultTags
  properties: {
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorPassword
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }

  // Allow other Azure services (including App Service) to reach the server.
  resource allowAzure 'firewallRules@2023-08-01-preview' = {
    name: 'AllowAllAzureIps'
    properties: {
      startIpAddress: '0.0.0.0'
      endIpAddress: '0.0.0.0'
    }
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-08-01-preview' = {
  parent: sqlServer
  name: databaseName
  location: location
  tags: defaultTags
  sku: {
    name: 'Basic'
    tier: 'Basic'
    capacity: 5
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 2147483648 // 2 GB - smallest Basic tier
  }
}

output sqlServerName string = sqlServer.name
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output databaseName string = sqlDatabase.name
