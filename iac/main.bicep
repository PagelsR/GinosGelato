// Deploy Azure infrastructure for Gino's Gelato
// App Service (API) + Static Web App (frontend)
// Assumes resource group already exists

targetScope = 'resourceGroup'

// Parameters
@description('Azure region for all resources')
param location string = 'eastus'

@description('Created by')
param createdBy string = 'Randy Pagels'

@description('Cost center')
param costCenter string = 'GinosGelato'

// Variables - Centralized resource naming
// Recommended abbreviations: https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations
var appServicePlanName = 'plan-${uniqueString(subscription().subscriptionId, resourceGroup().id)}'
var appServiceName = 'app-${uniqueString(subscription().subscriptionId, resourceGroup().id)}'
var staticWebAppName = 'swa-${uniqueString(subscription().subscriptionId, resourceGroup().id)}'

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

// Deploy App Service (depends on App Service Plan and Static Web App for CORS)
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

// Outputs for pipeline and verification
output appServiceName string = appServiceName
output appServiceUrl string = 'https://${appService.outputs.appServiceDefaultHostName}'
output appServicePrincipalId string = appService.outputs.appServicePrincipalId
output staticWebAppName string = staticWebAppName
output staticWebAppUrl string = staticWebApp.outputs.staticWebAppUrl
