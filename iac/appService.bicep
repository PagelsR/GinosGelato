// App Service module for FIFOWorldCup
// Based on eShop proven patterns

@description('Location for the App Service')
param location string = 'eastus'

@description('Name for the App Service')
param appServiceName string

@description('App Service Plan ID')
param appServicePlanId string

@description('Application Insights name')
param appInsightsName string

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
      healthCheckPath: '/health'
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
    keyVaultReferenceIdentity: 'SystemAssigned'
  }
}

// Reference existing Application Insights for the web test
resource existingAppInsights 'Microsoft.Insights/components@2020-02-02' existing = {
  name: appInsightsName
}

// Availability web test for production
resource webTestHomePage 'Microsoft.Insights/webtests@2022-06-15' = {
  name: 'HomePage-PingTest-${appServiceName}'
  location: location
  tags: {
    'hidden-link:${existingAppInsights.id}': 'Resource'
  }
  kind: 'ping'
  properties: {
    SyntheticMonitorId: appInsightsName
    Name: 'FIFOWorldCup Home Page Test'
    Description: 'Availability test for the FIFOWorldCup application'
    Enabled: true
    Frequency: 300
    Timeout: 120
    Kind: 'standard'
    RetryEnabled: true
    Locations: [
      {
        Id: 'us-va-ash-azr' // East US
      }
      {
        Id: 'us-fl-mia-edge' // Central US
      }
      {
        Id: 'us-ca-sjc-azr' // West US
      }
    ]
    Request: {
      RequestUrl: 'https://${appService.properties.defaultHostName}/'
      Headers: null
      HttpVerb: 'GET'
      RequestBody: null
      ParseDependentRequests: false
      FollowRedirects: null
    }
    ValidationRules: {
      ExpectedHttpStatusCode: 200
      IgnoreHttpStatusCode: false
      ContentValidation: null
      SSLCheck: true
      SSLCertRemainingLifetimeCheck: 7
    }
  }
}

output appServiceId string = appService.id
output appServiceName string = appService.name
output appServicePrincipalId string = appService.identity.principalId
output appServiceDefaultHostName string = appService.properties.defaultHostName
