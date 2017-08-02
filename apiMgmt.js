const msRestAzure = require('ms-rest-azure');
const {URL} = require('url');

class ApiMgmt {
    async setPolicy(credentials, policyContent) {
        const url = new URL(
            'https://management.azure.com/' +
            `subscriptions/${process.env.subscriptionId}/` +
            `resourceGroups/${process.env.resourceGroup}/` +
            'providers/Microsoft.ApiManagement/' +
            `service/${process.env.apiManagementServiceName}/` +
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
            throw new Error(`error setting global API policy; error was: ${JSON.stringify(result.error)}`);
        }
        console.log(`set global policy successfully`);
    };
}

// export singleton
module.exports = new ApiMgmt();