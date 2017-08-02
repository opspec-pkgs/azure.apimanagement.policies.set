const msRestAzure = require('ms-rest-azure');
const {URL} = require('url');

class ApiMgmtApi {
    async setPolicy(credentials, apiId, policyContent) {
        const url = new URL(
            'https://management.azure.com/' +
            `subscriptions/${process.env.subscriptionId}/` +
            `resourceGroups/${process.env.resourceGroup}/` +
            'providers/Microsoft.ApiManagement/' +
            `service/${process.env.apiManagementServiceName}/` +
            `apis/${apiId}/` +
            `policies/policy` +
            '?api-version=2017-03-01');

        const azureServiceClient = new msRestAzure.AzureServiceClient(credentials);

        let options = {
            method: 'PUT',
            url: url.href,
            body: {
                properties: {
                    policyContent
                }
            }
        };

        const result = await azureServiceClient.sendRequest(options);

        if (result.error) {
            throw new Error(`error setting policy for apiId: '${apiId}'; error was: ${JSON.stringify(result.error)}`);
        }
        console.log(`set policy for apiId: '${apiId}' successfully`);
    };


    async getIdByName(credentials, apiName) {
        const url = new URL(
            'https://management.azure.com/' +
            `subscriptions/${process.env.subscriptionId}/` +
            `resourceGroups/${process.env.resourceGroup}/` +
            'providers/Microsoft.ApiManagement/' +
            `service/${process.env.apiManagementServiceName}/` +
            `apis` +
            '?api-version=2017-03-01');

        const azureServiceClient = new msRestAzure.AzureServiceClient(credentials);

        let options = {
            method: 'GET',
            url: url.href,
        };

        const result = await azureServiceClient.sendRequest(options);

        if (result.error) {
            throw new Error(JSON.stringify(result.error));
        }

        let operationId;
        for (let i = 0; i < result.value.length; i++) {
            const item = result.value[i];
            if (item.properties.displayName === apiName) {
                operationId = item.name;
                break;
            }
        }

        if (!operationId) {
            throw new Error(`no API found w/ displayName: '${apiName}'`);
        }

        return operationId;
    }
}

// export singleton
module.exports = new ApiMgmtApi();