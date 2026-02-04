// App Service module for Gino's Gelato
// Based on eShop proven patterns

@description('Location for the App Service')
param location string = 'eastus'

@description('Name for the App Service')
param appServiceName string

@description('App Service Plan ID')
param appServicePlanId string

@description('Static Web App URL for CORS')
param staticWebAppUrl string = ''

@description('Resource tags')
param defaultTags object

resource appService 'Microsoft.Web/sites@2023-01-01' = {
  name: appServiceName
  location: location
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  tags: defaultTags
  properties: {
    enabled: true
    serverFarmId: appServicePlanId
    httpsOnly: true
    siteConfig: {
      numberOfWorkers: 1
      linuxFxVersion: 'DOTNETCORE|8.0'
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      healthCheckPath: '/api/flavors'
      autoHealEnabled: true
      http20Enabled: false
      functionAppScaleLimit: 0
      minimumElasticInstanceCount: 0
      cors: {
        allowedOrigins: [
          'http://localhost:5173'
          'http://localhost:5174'
          staticWebAppUrl
        ]
        supportCredentials: false
      }
    }
    scmSiteAlsoStopped: false
    clientAffinityEnabled: true
    clientCertEnabled: false
    clientCertMode: 'Required'
    hostNamesDisabled: false
    containerSize: 0
    dailyMemoryTimeQuota: 0
    redundancyMode: 'None'
    storageAccountRequired: false
  }
}

output appServiceId string = appService.id
output appServiceName string = appService.name
output appServicePrincipalId string = appService.identity.principalId
output appServiceDefaultHostName string = appService.properties.defaultHostName
