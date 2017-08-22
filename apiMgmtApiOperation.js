const msRestAzure = require('ms-rest-azure');
const {URL} = require('url');
const axios = require('axios');

class ApiMgmtApiOperation {
    async setPolicy(credentials, apiRef, operationRef, policyContent) {
        const url = new URL(
            `https://${process.env.apiManagementServiceName}.management.azure-api.net/` +
            `apis/${apiRef.id}/` +
            `operations/${operationRef.id}/` +
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

        const result = await axios(options)
        .catch(function (error) {
            throw new Error(`error setting policy for operation '${operationRef.name}' of api '${apiRef.name}'; error was: ${error.response.statusText}`);
        });

        console.log(`set policy for operation '${operationRef.name}' of api '${apiRef.name}' successfully`);
    };

    async getIdByName(credentials, apiRef, operationName){
        const url = new URL(
            'https://management.azure.com/' +
            `subscriptions/${process.env.subscriptionId}/` +
            `resourceGroups/${process.env.resourceGroup}/` +
            'providers/Microsoft.ApiManagement/' +
            `service/${process.env.apiManagementServiceName}/` +
            `apis/${apiRef.id}/` +
            `operations` +
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
            if (item.properties.displayName === operationName) {
                operationId = item.name;
                break;
            }
        }

        if (!operationId){
            throw new Error(`no operation found w/ displayName: '${operationName}' in api '${apiRef.name}'`);
        }

        return operationId;
    }
}

// export singleton
module.exports = new ApiMgmtApiOperation();