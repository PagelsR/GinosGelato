targetScope = 'subscription'

@description('Location for all resources')
param location string = 'eastus'

@description('Resource group name')
param resourceGroupName string = 'rg-GinosGelato'

resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
}

output resourceGroupName string = resourceGroup.name
output location string = resourceGroup.location
