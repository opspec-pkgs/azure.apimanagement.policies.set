const msRestAzure = require('ms-rest-azure');
const fs = require('fs');
const apiMgmt = require('./apiMgmt');
const apiMgmtApi = require('./apiMgmtApi');
const apiMgmtApiOperation = require('./apiMgmtApiOperation');
const apiMgmtProduct = require('./apiMgmtProduct');
const path = require('path');

const POLICY_FILENAME = 'policy.xml';

const login = async () => {
    console.log('logging in');

    const loginType = process.env.loginType;
    const loginId = process.env.loginId;
    const loginSecret = process.env.loginSecret;

    let response;
    if (loginType === 'sp') {
        // https://github.com/Azure/azure-sdk-for-node/blob/66a255dd882762e93e5b9b92ba63ebb222962d59/runtime/ms-rest-azure/lib/login.js#L414
        response = await msRestAzure.loginWithServicePrincipalSecret(loginId, loginSecret, process.env.loginTenantId);
    } else {
        // https://github.com/Azure/azure-sdk-for-node/blob/66a255dd882762e93e5b9b92ba63ebb222962d59/runtime/ms-rest-azure/index.d.ts#L376
        response = await msRestAzure.loginWithUsernamePassword(loginId, loginSecret, {domain: process.env.loginTenantId});
    }

    console.log('login successful');

    return response;
};

/**
 * Processes a /policies/apis/{api-name}/{operation-name} dir
 * @param credentials
 * @param {Object} apiRef
 * @param dirPath
 * @returns {Promise.<*>}
 */
const processApiOperationDir = async (credentials, apiRef, dirPath) => {
    const policyAbsPath = `${dirPath}/${POLICY_FILENAME}`;
    if (fs.existsSync(policyAbsPath)) {
        const operationName = path.basename(dirPath);

        return apiMgmtApiOperation
            .getIdByName(credentials, apiRef, operationName)
            .then(operationId =>
                apiMgmtApiOperation.setPolicy(
                    credentials,
                    apiRef,
                    {
                        id: operationId,
                        name: operationName,
                    },
                    fs.readFileSync(policyAbsPath, 'utf8')
                )
            );
    }
    return Promise.resolve();
};

/**
 * Processes a /policies/apis/{api-name} dir
 * @param credentials
 * @param dirPath
 * @returns {Promise.<*>}
 */
const processApiDir = async (credentials, dirPath) => {
    const promises = [];

    const items = fs.readdirSync(dirPath);

    if (items.length > 0) {
        const apiName = path.basename(dirPath);
        const apiRef = {
            id: await apiMgmtApi.getIdByName(credentials, apiName),
            name: apiName,
        };

        items.forEach(item => {
            const itemAbsPath = `${dirPath}/${item}`;
            const itemStat = fs.statSync(itemAbsPath);

            if (itemStat.isDirectory()) {
                promises.push(
                    processApiOperationDir(
                        credentials,
                        apiRef,
                        itemAbsPath
                    )
                );
            } else if (item === POLICY_FILENAME) {
                promises.push(
                    apiMgmtApi.setPolicy(
                        credentials,
                        apiRef,
                        fs.readFileSync(itemAbsPath, 'utf8')
                    )
                );
            }
        });
    }

    return Promise.all(promises);
};

/**
 * Processes the /policies/apis dir
 * @param credentials
 * @param dirPath
 * @returns {Promise.<*>}
 */
const processApisDir = async (credentials, dirPath) => {
    const promises = [];
    fs.readdirSync(dirPath).forEach(item => {
        const itemAbsPath = `${dirPath}/${item}`;
        const itemStat = fs.statSync(itemAbsPath);

        if (itemStat.isDirectory()) {
            promises.push(
                processApiDir(credentials, itemAbsPath)
            );
        }
    });
    return Promise.all(promises);
};

/**
 * Processes a /policies/products/{product-name} dir
 * @param credentials
 * @param dirPath
 * @returns {Promise.<*>}
 */
const processProductDir = async (credentials, dirPath) => {
    const policyAbsPath = `${dirPath}/${POLICY_FILENAME}`;

    if (fs.existsSync(policyAbsPath)) {
        const productName = path.basename(dirPath);

        return apiMgmtProduct
            .getIdByName(credentials, productName)
            .then(apiId =>
                apiMgmtProduct.setPolicy(
                    credentials,
                    {
                        id: apiId,
                        name: productName,
                    },
                    fs.readFileSync(policyAbsPath, 'utf8')
                )
            );
    }
    return Promise.resolve();
};

/**
 * Processes the /policies/products dir
 * @param credentials
 * @param dirPath
 * @returns {Promise.<*>}
 */
const processProductsDir = async (credentials, dirPath) => {
    const promises = [];
    fs.readdirSync(dirPath).forEach(item => {
        const itemAbsPath = `${dirPath}/${item}`;
        const itemStat = fs.statSync(itemAbsPath);

        if (itemStat.isDirectory()) {
            promises.push(
                processProductDir(credentials, itemAbsPath)
            );
        }
    });
    return Promise.all(promises);
};

/**
 * Sets policies by walking the policies dir tree, conventionally applying discovered policy.xml files
 * @param credentials
 * @returns {Promise.<*>}
 */
const setPolicies = async (credentials) => {
    const promises = [];
    const dirPath = '/policies';
    fs.readdirSync(dirPath).forEach(item => {
        const itemAbsPath = `${dirPath}/${item}`;

        switch (item) {
            case 'apis':
                promises.push(processApisDir(credentials, itemAbsPath));
                break;
            case 'products':
                promises.push(processProductsDir(credentials, itemAbsPath));
                break;
            case POLICY_FILENAME:
                promises.push(apiMgmt.setPolicy(credentials, fs.readFileSync(itemAbsPath, 'utf8')));
                break;
        }
    });
    return Promise.all(promises);
};

login()
    .then(credentials => setPolicies(credentials))
    .catch(error => {
        console.log(error);
        process.exit(1)
    });