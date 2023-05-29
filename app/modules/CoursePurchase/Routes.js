module.exports = (app, express) => {

    const router = express.Router();
    const CoursePurchaseController = require("./Controller").CoursePurchaseController
    const Globals = require("../../../configs/Globals");
    const config = require('../../../configs/configs');
    const Validators = require("./Validator")
    




    app.use(config.baseApiUrl, router);
}