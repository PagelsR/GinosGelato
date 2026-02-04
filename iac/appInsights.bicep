// Application Insights module for FIFOWorldCup
// Based on eShop proven patterns

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

// Log Analytics workspace for Application Insights
resource applicationInsightsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
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
resource metricAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: appInsightsAlertName
  location: 'global'
  tags: defaultTags
  properties: {
    description: 'Alert when response time exceeds 5 seconds'
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
          threshold: 5000
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
resource emailActionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: 'ag-${uniqueString(resourceGroup().id)}'
  location: 'global'
  tags: defaultTags
  properties: {
    groupShortName: 'FIFOAlerts'
    enabled: true
    emailReceivers: [
      {
        name: 'Admin Email'
        emailAddress: 'rpagels@microsoft.com'
        useCommonAlertSchema: true
      }
    ]
  }
}

// Outputs
output appInsightsId string = applicationInsights.id
output appInsightsName string = applicationInsights.name
output appInsightsInstrumentationKey string = applicationInsights.properties.InstrumentationKey
output appInsightsConnectionString string = applicationInsights.properties.ConnectionString
output appInsightsApplicationId string = applicationInsights.properties.ApplicationId
output appInsightsApiApplicationId string = applicationInsights.properties.AppId
output workspaceId string = applicationInsightsWorkspace.id
