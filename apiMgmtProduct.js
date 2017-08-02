const msRestAzure = require('ms-rest-azure');
const {URL} = require('url');

class ApiMgmtProduct {

    async setPolicy(credentials, productRef, policyContent) {
        const url = new URL(
            'https://management.azure.com/' +
            `subscriptions/${process.env.subscriptionId}/` +
            `resourceGroups/${process.env.resourceGroup}/` +
            'providers/Microsoft.ApiManagement/' +
            `service/${process.env.apiManagementServiceName}/` +
            `products/${productRef.id}/` +
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
            throw new Error(`error setting policy for product '${productRef.name}'; error was: ${JSON.stringify(result.error)}`);
        }
        console.log(`set policy for product '${productRef.name}' successfully`);
    };

    async getIdByName(credentials, productName){
        const url = new URL(
            'https://management.azure.com/' +
            `subscriptions/${process.env.subscriptionId}/` +
            `resourceGroups/${process.env.resourceGroup}/` +
            'providers/Microsoft.ApiManagement/' +
            `service/${process.env.apiManagementServiceName}/` +
            `products` +
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
        for (let i = 0; i < result.value.length; i++ ) {
            const item = result.value[i];
            if (item.properties.displayName === productName) {
                operationId = item.name;
                break;
            }
        }

        if (!operationId){
            throw new Error(`no product found w/ displayName: '${productName}'`);
        }

        return operationId;
    }
}

// export singleton
module.exports = new ApiMgmtProduct();