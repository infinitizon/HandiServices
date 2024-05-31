const swaggerAutoGen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Primay Offer APIs',
        description: 'Collection of API endpoints for Primary Offer E-IPO application',
    },
    host: 'localhost:2110',
    schemes: ['http'],
    consumes: [],  // by default: ['application/json']
    produces: [],  // by default: ['application/json']
    tags: [        // by default: empty Array
        {
            name: 'Primay Offer APIs',         // Tag name
            description: 'Collection of API endpoints for Primay Offer E-IPO application',  // Tag description
        },
        // { ... }
    ],
    securityDefinitions: {},  // by default: empty object
    definitions: {},
    components: {
        schemas: {
            Product: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                    },
                    name: {
                        type: 'string',
                    },
                    description: {
                        type: 'string',
                    },
                    currency: {
                        type: 'string',
                    },
                    sharePrice: {
                        type: 'number',
                    },
                    minPurchaseUnits: {
                        type: 'integer',
                    },
                    subsequentMultipleUnits: {
                        type: 'integer',
                    },
                    openingDate: {
                        type: 'string',
                        format: 'date',
                    },
                    closingDate: {
                        type: 'string',
                        format: 'date',
                    },
                    tenantId: {
                        type: 'string',
                        format: 'uuid',
                    },
                },
                required: ['name', 'description','minPurchaseUnits', 'subsequentMultipleUnits', 'currency', 'sharePrice', 'openingDate', 'closingDate'],
            },
            createAsset: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                    },
                    description: {
                        type: 'string',
                    },
                    currency: {
                        type: 'string',
                    },
                    sharePrice: {
                        type: 'number',
                    },
                    minPurchaseUnits: {
                        type: 'integer',
                    },
                    subsequentMultipleUnits: {
                        type: 'integer',
                    },
                    openingDate: {
                        type: 'string',
                        format: 'date',
                    },
                    closingDate: {
                        type: 'string',
                        format: 'date',
                    },
                    tenantId: {
                        type: 'string',
                        format: 'uuid',
                        require: false
                    },
                },
            }
    }
    }
};

const outputFile = './swagger-output.json';
const endpointFiles = ['../../src/app.js'];

swaggerAutoGen(outputFile, endpointFiles, doc);