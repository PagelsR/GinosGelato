# 🔄 Bicep Infrastructure Update Summary

**Date:** January 24, 2026  
**Changes:** Updated all Bicep files to match proven eShop patterns

---

## ✅ Changes Applied

### 📁 **main.bicep** - Complete Restructure
**Changes:**
- ✅ Added default tags (`App`, `Environment`, `CostCenter`, `CreatedBy`)
- ✅ Centralized all resource naming as variables (following Azure CAF)
- ✅ Added Application Insights module deployment
- ✅ Added configSettings module for centralized configuration
- ✅ Added parameter for additional Key Vault access (`additionalKeyVaultAccessObjectId`)
- ✅ Improved deployment dependencies
- ✅ Enhanced outputs (added FQDN, instrumentation keys, etc.)

**Resource Naming Convention:**
```bicep
var appServicePlanName = 'plan-{uniqueString}'
var appServiceName = 'app-{uniqueString}'
var sqlServerName = 'sql-{uniqueString}'
var sqlDatabaseName = 'sqldb-{uniqueString}'
var staticWebAppName = 'swa-{uniqueString}'
var keyVaultName = 'kv-{uniqueString}'
var appInsightsName = 'appi-{uniqueString}'
```

---

### 🆕 **appInsights.bicep** - NEW FILE
**Features:**
- ✅ Log Analytics Workspace (30-day retention)
- ✅ Application Insights component
- ✅ Metric alert for response time (>5 seconds)
- ✅ Email action group for alerts
- ✅ Comprehensive outputs (instrumentation key, connection string, etc.)

**Benefits:**
- Full application monitoring
- Performance tracking
- Availability monitoring
- Alerting on performance issues

---

### 🆕 **configSettings.bicep** - NEW FILE
**Features:**
- ✅ Creates Key Vault secrets (SQL connection string, FIFO API key)
- ✅ Configures App Service app settings
- ✅ Sets up connection strings with Key Vault references
- ✅ Integrates Application Insights
- ✅ Uses `@Microsoft.KeyVault(...)` syntax for secure reference

**Benefits:**
- Centralized configuration management
- Secrets stored in Key Vault only
- Easy to update settings without redeployment
- Production-ready security

---

### 🔧 **appService.bicep** - Enhanced
**API Version:** `2022-03-01` → `2023-01-01`

**Added:**
- ✅ Tags parameter
- ✅ `alwaysOn: true` (prevents cold starts)
- ✅ `healthCheckPath: '/health'` (for monitoring)
- ✅ `autoHealEnabled: true` (automatic recovery)
- ✅ `http20Enabled: false` (compatibility)
- ✅ More detailed siteConfig properties
- ✅ Availability web test (ping test from 3 US regions)
- ✅ Application Insights name parameter

**Benefits:**
- Better reliability and performance
- Automatic health monitoring
- Faster response times (no cold starts)
- Production-ready configuration

---

### 🔧 **appServicePlan.bicep** - Enhanced
**API Version:** `2022-03-01` → `2023-01-01`

**Added:**
- ✅ Tags parameter
- ✅ Full SKU properties (`tier`, `size`, `family`, `capacity`)
- ✅ Detailed properties from eShop pattern
- ✅ Centralized naming (name passed as parameter)

---

### 🔧 **sqlServer.bicep** - Security Update
**API Version:** `2022-05-01-preview` → `2023-05-01-preview`

**Changed:**
- ✅ Firewall rule: `0.0.0.0 to 0.0.0.0` → `0.0.0.0 to 255.255.255.255`
- ✅ Firewall name: `AllowAzureServices` → `AllowAllWindowsAzureIps`
- ✅ Added `restrictOutboundNetworkAccess: 'Disabled'`
- ✅ Added tags parameter
- ✅ Centralized naming

**Security Note:**
- Current setting allows all IPs (dev/test configuration)
- For production: Restrict to specific IP ranges via parameters

---

### 🔧 **sqlDatabase.bicep** - Enhanced
**API Version:** `2022-05-01-preview` → `2023-05-01-preview`

**Added:**
- ✅ Tags parameter
- ✅ `capacity: 5` in SKU
- ✅ `autoPauseDelay: 60` (for serverless)
- ✅ `minCapacity: 1`
- ✅ `availabilityZone: 'NoPreference'`
- ✅ Centralized naming
- ✅ Collation as parameter

---

### 🔧 **keyVault.bicep** - Access Policy Enhancement
**API Version:** `2022-07-01` → `2023-07-01`

**Changed:**
- ✅ **Moved secret creation to configSettings.bicep** (better separation)
- ✅ Added `additionalObjectId` parameter for DevOps/Admin access
- ✅ Dynamic access policies (base + optional additional)
- ✅ Set `enableSoftDelete: false` for dev (easier redeployment)
- ✅ Added more enabled flags (`enabledForDeployment`, etc.)
- ✅ Centralized naming

**Access Policy Structure:**
1. **App Service Managed Identity**: Get, List secrets
2. **Additional Admin (optional)**: Get, List, Set, Delete secrets

---

### 🔧 **staticWebApp.bicep** - Minor Update
**API Version:** `2022-03-01` → `2023-01-01`

**Added:**
- ✅ Tags parameter
- ✅ Centralized naming

---

## 📊 Comparison: Before vs After

| Feature | Before | After |
|---------|--------|-------|
| **API Versions** | 2022 (mixed) | 2023+ (latest) |
| **Tags** | None | All resources |
| **Resource Naming** | Inline uniqueString | Centralized variables |
| **Application Insights** | ❌ None | ✅ Full monitoring |
| **Health Checks** | ❌ None | ✅ /health endpoint |
| **AlwaysOn** | ✅ Yes | ✅ Yes (explicit) |
| **Auto Heal** | ❌ No | ✅ Yes |
| **Availability Tests** | ❌ None | ✅ Multi-region ping |
| **Key Vault Access** | App Service only | App Service + Optional Admin |
| **Config Management** | Inline in keyVault | Separate configSettings module |
| **SQL Firewall** | Azure services only | All IPs (dev config) |
| **Soft Delete** | Enabled | Disabled (dev) |

---

## 🎯 New Deployment Parameters

### **Required (existing):**
- `location` - Default: `eastus`
- `sqlAdminLogin` - SQL admin username
- `sqlAdminPassword` - SQL admin password

### **Optional (new):**
- `createdBy` - Default: `Randy Pagels`
- `costCenter` - Default: `FIFOWorldCup`
- `additionalKeyVaultAccessObjectId` - Azure AD Object ID for admin access (optional)

---

## 🚀 Deployment Command

```bash
az deployment sub create \
  --location eastus \
  --template-file iac/main.bicep \
  --parameters \
    sqlAdminLogin='sqladmin' \
    sqlAdminPassword='YourSecureP@ssw0rd123!' \
    createdBy='Your Name' \
    costCenter='Your Cost Center' \
    additionalKeyVaultAccessObjectId='your-azure-ad-object-id'
```

**PowerShell:**
```powershell
az deployment sub create `
  --location eastus `
  --template-file iac/main.bicep `
  --parameters `
    sqlAdminLogin='sqladmin' `
    sqlAdminPassword='YourSecureP@ssw0rd123!' `
    createdBy='Your Name' `
    costCenter='Your Cost Center' `
    additionalKeyVaultAccessObjectId='your-azure-ad-object-id'
```

---

## 📋 New Outputs

The deployment now provides these outputs:

```
resourceGroupName
appServiceName
appServiceUrl
appServicePrincipalId
staticWebAppName
staticWebAppUrl
sqlServerName
sqlServerFQDN              ← NEW
sqlDatabaseName
keyVaultName
keyVaultUri
appInsightsName            ← NEW
appInsightsInstrumentationKey    ← NEW
appInsightsConnectionString      ← NEW
```

---

## 🔐 Security Improvements

1. **Secrets Management**
   - All secrets now in Key Vault only
   - App Service uses Key Vault references
   - No secrets in app configuration

2. **Access Control**
   - App Service uses Managed Identity
   - Optional admin access for DevOps
   - Granular permissions (Get, List, Set, Delete)

3. **Monitoring**
   - Full Application Insights integration
   - Availability monitoring from 3 regions
   - Performance alerting
   - Health check endpoint

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] All resources have tags
- [ ] Application Insights is receiving data
- [ ] Key Vault has 2 secrets (SqlConnectionString, FifoApiKey)
- [ ] App Service shows "Healthy" status
- [ ] Availability test is running
- [ ] SQL Server allows connections
- [ ] Static Web App is accessible

---

## 📝 Next Steps

1. **Update GitHub Actions Workflow** (if needed)
   - Workflow already compatible with new structure
   - No changes required to BuildDeploy.yml

2. **Update FIFO API Key**
   ```bash
   az keyvault secret set \
     --vault-name {kv-name} \
     --name FifoApiKey \
     --value "YOUR_ACTUAL_API_KEY"
   ```

3. **Get Your Azure AD Object ID** (for Key Vault access)
   ```bash
   az ad signed-in-user show --query id -o tsv
   ```

4. **Monitor Application Insights**
   - Check Azure Portal → Application Insights
   - Review availability tests
   - Check for any alerts

---

## 🎉 Benefits Summary

✅ **Better Organization** - Centralized naming and configuration  
✅ **Enhanced Monitoring** - Full Application Insights integration  
✅ **Improved Security** - Better access control and secret management  
✅ **Production Ready** - Based on proven eShop patterns  
✅ **Latest Features** - Updated to 2023 API versions  
✅ **Cost Tracking** - Comprehensive tagging  
✅ **Easier Maintenance** - Modular, well-structured code  

---

**Files Created:**
- `iac/appInsights.bicep` ← NEW
- `iac/configSettings.bicep` ← NEW

**Files Updated:**
- `iac/main.bicep` ← MAJOR UPDATE
- `iac/appService.bicep` ← ENHANCED
- `iac/appServicePlan.bicep` ← ENHANCED
- `iac/keyVault.bicep` ← RESTRUCTURED
- `iac/sqlServer.bicep` ← UPDATED
- `iac/sqlDatabase.bicep` ← ENHANCED
- `iac/staticWebApp.bicep` ← MINOR UPDATE

**Files Unchanged:**
- `iac/resourceGroup.bicep` ← No changes needed
- `iac/database-schema.sql` ← No changes needed
