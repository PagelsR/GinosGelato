// App Service Plan module for Gino's Gelato
// Based on eShop proven patterns

@description('Location for the App Service Plan')
param location string = 'eastus'

@description('Name for the App Service Plan')
param appServicePlanName string

@description('SKU for the App Service Plan')
param skuName string = 'B1'

@description('SKU tier')
param skuTier string = 'Basic'

@description('SKU capacity')
param skuCapacity int = 1

@description('Resource tags')
param defaultTags object

resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  tags: defaultTags
  sku: {
    name: skuName
    tier: skuTier
    size: skuName
    family: 'B'
    capacity: skuCapacity
  }
  kind: 'linux'
  properties: {
    perSiteScaling: false
    elasticScaleEnabled: false
    maximumElasticWorkerCount: 1
    isSpot: false
    reserved: true
    isXenon: false
    hyperV: false
    targetWorkerCount: 0
    targetWorkerSizeId: 0
    zoneRedundant: false
  }
}

output appServicePlanId string = appServicePlan.id
output appServicePlanName string = appServicePlan.name
