/****************************
 Configuration
 ****************************/
// For environment variables [will work with .env file]
require('custom-env').env('dev')
// require('custom-env').env('uat')
// require('custom-env').env('qa')

let ENV_VARIABLES = process.env;

console.log("ENV_VARIABLES", ENV_VARIABLES)

module.exports = {
    ...ENV_VARIABLES,
};
