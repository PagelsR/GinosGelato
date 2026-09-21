// Key Vault module for Gino's Gelato
// Uses access policies (matching the reference project). The App Service managed
// identity gets read access; an optional admin (your email's AAD object id) gets
// full secret management. Secrets themselves are created in configSettings.bicep.

@description('Location for the Key Vault')
param location string = 'eastus'

@description('Key Vault name')
param keyVaultName string

@description('Tenant ID for Key Vault')
param tenantId string = subscription().tenantId

@description('App Service managed identity principal ID')
param appServicePrincipalId string

@description('AAD object ID for the admin user (your email account). Empty to skip.')
param adminObjectId string = ''

@description('AAD object ID for the GitHub Actions / deployment service principal. Empty to skip.')
param deploymentPrincipalObjectId string = ''

@description('Resource tags')
param defaultTags object

// Base policy: the API's managed identity can read secrets at runtime.
var baseAccessPolicies = [
  {
    tenantId: tenantId
    objectId: appServicePrincipalId
    permissions: {
      secrets: [
        'get'
        'list'
      ]
    }
  }
]

// Admin (your email) gets full read/edit/delete access to secrets.
var adminAccessPolicy = !empty(adminObjectId) ? [
  {
    tenantId: tenantId
    objectId: adminObjectId
    permissions: {
      secrets: [
        'get'
        'list'
        'set'
        'delete'
        'backup'
        'restore'
        'recover'
        'purge'
      ]
    }
  }
] : []

// Optional deployment principal access (get/list/set) for pipelines that read secrets.
var deploymentAccessPolicy = !empty(deploymentPrincipalObjectId) ? [
  {
    tenantId: tenantId
    objectId: deploymentPrincipalObjectId
    permissions: {
      secrets: [
        'get'
        'list'
        'set'
      ]
    }
  }
] : []

var accessPolicies = concat(baseAccessPolicies, adminAccessPolicy, deploymentAccessPolicy)

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: defaultTags
  properties: {
    tenantId: tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enabledForDiskEncryption: false
    enableSoftDelete: false // dev/test: avoids soft-delete name collisions on redeploy
    publicNetworkAccess: 'Enabled'
    accessPolicies: accessPolicies
  }
}

output keyVaultId string = keyVault.id
output keyVaultName string = keyVault.name
output keyVaultUri string = keyVault.properties.vaultUri
