// Static Web App module for FIFOWorldCup
// Based on eShop proven patterns

@description('Location for the Static Web App')
param location string = 'eastus'

@description('Name for the Static Web App')
param staticWebAppName string

@description('SKU for the Static Web App')
param skuName string = 'Free'

@description('Resource tags')
param defaultTags object

resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: staticWebAppName
  location: location
  tags: defaultTags
  sku: {
    name: skuName
    tier: skuName
  }
  properties: {
    repositoryUrl: ''
    branch: ''
    buildProperties: {
      appLocation: 'predictionhub-client'
      apiLocation: ''
      outputLocation: 'dist'
    }
  }
}

output staticWebAppId string = staticWebApp.id
output staticWebAppName string = staticWebApp.name
output staticWebAppDefaultHostName string = staticWebApp.properties.defaultHostname
output staticWebAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'
