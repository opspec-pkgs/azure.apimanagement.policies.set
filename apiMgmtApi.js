const msRestAzure = require('ms-rest-azure');
const {URL} = require('url');
const axios = require('axios');

class ApiMgmtApi {
    async setPolicy(credentials, apiRef, policyContent) {
        const url = new URL(
            `https://${process.env.apiManagementServiceName}.management.azure-api.net/` +
            `apis/${apiRef.id}/` +
            `policy` +
            '?api-version=2017-03-01');
        
        const azureServiceClient = new msRestAzure.AzureServiceClient(credentials);

        const headers = {};
        headers['Authorization'] = `${process.env.sasToken}`;
        headers['Content-Type'] = `${process.env.contentType}`;
        headers['If-Match'] = '*';
		
		let options = {
            method: 'PUT',
            url: url.href,
			headers,
            data: policyContent
        };

        // Remove the default accept headers. Microsoft is rejecting the request with 406
        delete axios.defaults.headers.common.accept;

        const result = await axios(options)
        // look up what axios considers http errors
        .catch(function (error) {
            throw new Error(`error setting policy for api '${apiRef.name}'; error was: ${error.response.statusText}`);
        });

        console.log(`set policy for api '${apiRef.name}' successfully`);
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