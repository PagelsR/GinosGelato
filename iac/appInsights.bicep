// Application Insights module for Gino's Gelato
// Provides monitoring, metrics, and availability tests

@description('Location for Application Insights')
param location string = 'eastus'

@description('Application Insights name')
param appInsightsName string

@description('Log Analytics Workspace name')
param appInsightsWorkspaceName string

@description('Metric alert name')
param appInsightsAlertName string

@description('Resource tags')
param defaultTags object

@description('App Service URL for availability tests')
param appServiceUrl string = ''

@description('Static Web App URL for frontend availability tests')
param staticWebAppUrl string = ''

// Log Analytics workspace for Application Insights
resource applicationInsightsWorkspace 'Microsoft.OperationalInsights/workspaces@2025-07-01' = {
  name: appInsightsWorkspaceName
  location: location
  tags: defaultTags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      searchVersion: 1
      legacy: 0
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

// Application Insights
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: defaultTags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: applicationInsightsWorkspace.id
    RetentionInDays: 30
  }
}

// Metric Alert for Response Time
resource metricAlert 'Microsoft.Insights/metricAlerts@2024-03-01-preview' = {
  name: appInsightsAlertName
  location: 'global'
  tags: defaultTags
  properties: {
    description: 'Alert when API response time exceeds 3 seconds'
    severity: 2
    enabled: true
    scopes: [
      applicationInsights.id
    ]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'Response Time Threshold'
          metricName: 'requests/duration'
          operator: 'GreaterThan'
          threshold: 3000
          timeAggregation: 'Average'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: emailActionGroup.id
      }
    ]
  }
}

// Email Action Group
resource emailActionGroup 'Microsoft.Insights/actionGroups@2024-10-01-preview' = {
  name: 'ag-ginosgelato-${uniqueString(resourceGroup().id)}'
  location: 'global'
  tags: defaultTags
  properties: {
    groupShortName: 'GelatoAlert'
    enabled: true
    emailReceivers: [
      {
        name: 'Admin Email'
        emailAddress: 'randy.pagels@xebia.com'
        useCommonAlertSchema: true
      }
    ]
  }
}

// Availability Test - API Flavors Endpoint
resource flavorsAvailabilityTest 'Microsoft.Insights/webtests@2022-06-15' = if (!empty(appServiceUrl)) {
  name: 'avail-flavors-${appInsightsName}'
  location: location
  tags: union(defaultTags, {
    'hidden-link:${applicationInsights.id}': 'Resource'
  })
  kind: 'standard'
  properties: {
    SyntheticMonitorId: 'avail-flavors-${appInsightsName}'
    Name: 'Flavors API Check'
    Description: 'Monitors the /api/flavors endpoint availability'
    Enabled: true
    Frequency: 300
    Timeout: 30
    Kind: 'standard'
    RetryEnabled: true
    Locations: [
      {
        Id: 'us-va-ash-azr'
      }
      {
        Id: 'us-il-ch1-azr'
      }
      {
        Id: 'us-ca-sjc-azr'
      }
    ]
    Request: {
      RequestUrl: '${appServiceUrl}/api/flavors'
      Headers: null
      HttpVerb: 'GET'
      RequestBody: null
      ParseDependentRequests: false
      FollowRedirects: true
    }
    ValidationRules: {
      ExpectedHttpStatusCode: 200
      IgnoreHttpStatusCode: false
      SSLCheck: true
      SSLCertRemainingLifetimeCheck: 7
    }
  }
}

// Availability Test - API Toppings Endpoint
resource toppingsAvailabilityTest 'Microsoft.Insights/webtests@2022-06-15' = if (!empty(appServiceUrl)) {
  name: 'avail-toppings-${appInsightsName}'
  location: location
  tags: union(defaultTags, {
    'hidden-link:${applicationInsights.id}': 'Resource'
  })
  kind: 'standard'
  properties: {
    SyntheticMonitorId: 'avail-toppings-${appInsightsName}'
    Name: 'Toppings API Check'
    Description: 'Monitors the /api/toppings endpoint availability'
    Enabled: true
    Frequency: 300
    Timeout: 30
    Kind: 'standard'
    RetryEnabled: true
    Locations: [
      {
        Id: 'us-va-ash-azr'
      }
      {
        Id: 'us-il-ch1-azr'
      }
      {
        Id: 'us-ca-sjc-azr'
      }
    ]
    Request: {
      RequestUrl: '${appServiceUrl}/api/toppings'
      Headers: null
      HttpVerb: 'GET'
      RequestBody: null
      ParseDependentRequests: false
      FollowRedirects: true
    }
    ValidationRules: {
      ExpectedHttpStatusCode: 200
      IgnoreHttpStatusCode: false
      SSLCheck: true
      SSLCertRemainingLifetimeCheck: 7
    }
  }
}

// Availability Test - Frontend Home Page
resource homePageAvailabilityTest 'Microsoft.Insights/webtests@2022-06-15' = if (!empty(staticWebAppUrl)) {
  name: 'avail-homepage-${appInsightsName}'
  location: location
  tags: union(defaultTags, {
    'hidden-link:${applicationInsights.id}': 'Resource'
  })
  kind: 'standard'
  properties: {
    SyntheticMonitorId: 'avail-homepage-${appInsightsName}'
    Name: 'Frontend Home Page Test'
    Description: 'Monitors the Gino\'s Gelato frontend availability'
    Enabled: true
    Frequency: 300
    Timeout: 30
    Kind: 'standard'
    RetryEnabled: true
    Locations: [
      {
        Id: 'us-il-ch1-azr'
      }
      {
        Id: 'us-va-ash-azr'
      }
      {
        Id: 'us-ca-sjc-azr'
      }
    ]
    Request: {
      RequestUrl: staticWebAppUrl
      Headers: null
      HttpVerb: 'GET'
      RequestBody: null
      ParseDependentRequests: false
      FollowRedirects: true
    }
    ValidationRules: {
      ExpectedHttpStatusCode: 200
      IgnoreHttpStatusCode: false
      ContentValidation: {
        ContentMatch: 'Gino'
        IgnoreCase: true
        PassIfTextFound: true
      }
      SSLCheck: true
      SSLCertRemainingLifetimeCheck: 7
    }
  }
}

// Outputs
output appInsightsId string = applicationInsights.id
output appInsightsName string = applicationInsights.name
output appInsightsInstrumentationKey string = applicationInsights.properties.InstrumentationKey
output appInsightsConnectionString string = applicationInsights.properties.ConnectionString
output appInsightsApplicationId string = applicationInsights.properties.ApplicationId
output workspaceId string = applicationInsightsWorkspace.id
