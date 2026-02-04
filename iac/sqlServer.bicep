// SQL Server module for FIFOWorldCup
// Based on eShop proven patterns

@description('Location for the SQL Server')
param location string = 'eastus'

@description('Name for the SQL Server')
param sqlServerName string

@description('SQL Server administrator login')
@secure()
param administratorLogin string

@description('SQL Server administrator password')
@secure()
param administratorLoginPassword string

@description('Resource tags')
param defaultTags object

resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: sqlServerName
  location: location
  tags: defaultTags
  properties: {
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorLoginPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
    restrictOutboundNetworkAccess: 'Disabled'
  }
}

// Allow all Azure services and IPs (dev/test configuration)
// For production, restrict to specific IP ranges
resource firewallRule 'Microsoft.Sql/servers/firewallRules@2023-05-01-preview' = {
  name: 'AllowAllWindowsAzureIps'
  parent: sqlServer
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '255.255.255.255'
  }
}

output sqlServerId string = sqlServer.id
output sqlServerName string = sqlServer.name
output sqlServerFullyQualifiedDomainName string = sqlServer.properties.fullyQualifiedDomainName
