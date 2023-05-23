module.exports = (app, express) => {

    const router = express.Router();

    const HomepageController = require('../Home/Controller');
    const config = require('../../../configs/configs');

    app.post('/addHomepage', (req, res, next) => {
        const homepageObj = (new HomepageController()).boot(req, res);
        return homepageObj.addHomepage();
    });

    app.post('/homepage', (req, res, next) => {
        const homepageObj = (new HomepageController()).boot(req, res);
        return homepageObj.homepage();
    });

    app.use(config.baseApiUrl, router);
}