// SQL Database module for FIFOWorldCup
// Based on eShop proven patterns

@description('Location for the SQL Database')
param location string = 'eastus'

@description('Name for the SQL Database')
param sqlDatabaseName string

@description('SQL Server name')
param sqlServerName string

@description('Database collation')
param databaseCollation string = 'SQL_Latin1_General_CP1_CI_AS'

@description('Database SKU name')
param skuName string = 'Basic'

@description('Database SKU tier')
param skuTier string = 'Basic'

@description('Resource tags')
param defaultTags object

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  name: '${sqlServerName}/${sqlDatabaseName}'
  location: location
  tags: defaultTags
  sku: {
    name: skuName
    tier: skuTier
    capacity: 5
  }
  properties: {
    collation: databaseCollation
    catalogCollation: databaseCollation
    maxSizeBytes: 2147483648 // 2GB
    zoneRedundant: false
    readScale: 'Disabled'
    requestedBackupStorageRedundancy: 'Local'
    availabilityZone: 'NoPreference'
    autoPauseDelay: 60
    minCapacity: 1
  }
}

output sqlDatabaseId string = sqlDatabase.id
output sqlDatabaseName string = sqlDatabaseName
