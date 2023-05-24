/****************************
 SERVER MAIN FILE
 ****************************/

// need to add in case of self-signed certificate connection
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

// Include Modules
let exp = require('express');
let path = require('path');
let fs = require('fs');
let https = require('https');
let i18n = require("i18n");
const expressApp = require('express');

let config = require('./configs/configs');
let express = require('./configs/express');
let mongoose = require('./configs/mongoose');
let cronService = require('./app/services/Cron');
let CommonService = require('./app/services/Common');
let seedService = require('./app/services/Seed');

i18n.configure({
    locales: ['en', 'es', 'de'],
    directory: __dirname + '/app/locales',
    defaultLocale: 'en',
});
let swaggerUi = require('swagger-ui-express');

// HTTP Authentication
var basicAuth = require('basic-auth');
var auth = function (req, res, next) {
    var user = basicAuth(req);
    if (!user || !user.name || !user.pass) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        res.sendStatus(401);
        return;
    }
    if (user.name === config.HTTPAuthUser && user.pass === config.HTTPAuthPassword) {
        next();
    } else {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        res.sendStatus(401);
        return;
    }
}

global.appRoot = path.resolve(__dirname);

db = mongoose();
const app = express();
app.use('/images', expressApp.static(path.join(__dirname, 'images')));

app.get('/', function (req, res, next) {
    res.send('hello world');
});

/* Old path for serving public folder */
app.use('/public', exp.static(__dirname + '/public'));

if (process.env.NODE_ENV !== "production") {
    // var options = {
    //     customCss: '.swagger-ui .models { display: none }'
    // };
    var options = {
        customCss: '.swagger-ui .models { display: none }',
        customSiteTitle: "CLIVI: " + process.env.NODE_ENV,
        swaggerOptions: {
            docExpansion: "none",
            tagsSorter: "alpha"
        }
    };
    let mainSwaggerData = JSON.parse(fs.readFileSync('swagger.json'));
    mainSwaggerData.host = config.host;
    // mainSwaggerData.host = config.host + ':' + config.serverPort; 
    mainSwaggerData.basePath = config.baseApiUrl;

    const modules = './app/modules';
    fs.readdirSync(modules).forEach(file => {
        if (fs.existsSync(modules + '/' + file + '/swagger.json')) {
            const stats = fs.statSync(modules + '/' + file + '/swagger.json');
            const fileSizeInBytes = stats.size;
            if (fileSizeInBytes) {
                let swaggerData = fs.readFileSync(modules + '/' + file + '/swagger.json');
                swaggerData = swaggerData ? JSON.parse(swaggerData) : { paths: {}, definitions: {} };
                mainSwaggerData.paths = { ...swaggerData.paths, ...mainSwaggerData.paths };
                mainSwaggerData.definitions = { ...swaggerData.definitions, ...mainSwaggerData.definitions };
            }
        }
    });
    if (config.isHTTPAuthForSwagger && config.isHTTPAuthForSwagger == 'true') {
        app.get("/docs", auth, (req, res, next) => {
            next();
        });
    }
    let swaggerDocument = mainSwaggerData;
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
}

//(new cronService()).scheduleCronJobs();
(new seedService()).seedData();

// Listening Server
app.listen(parseInt(config.serverPort), async () => {
    console.log('process.env.NODE_ENV', process.env.NODE_ENV);
    console.log(`Server running at http://localhost:${config.serverPort}`);
});
