const _ = require("lodash");

const Controller = require("../Base/Controller");
const Homepage = require('./Schema').Homepage;
const Model = require("../Base/Model");

class HomepageController extends Controller {
    constructor() {
        super();
    }
    async addHomepage() {
        try {
            await new Model(Homepage).store(req.body);
        } catch (error) {
            this.res.send({ status: 0, message: 'Error in save Homepage Details' });
        }
    }

    async homepage() {
        let _this = this;
        try {
            const homepage = await Homepage.findOne();
            if (!_.isEmpty(homepage)) return _this.res.send({ status: 0, message: 'Data not found' });

            _this.res.send({ status: 1, message: 'Home page data', data: homepage });
        } catch (error) {
            _this.res.send({ status: 0, message: error });
        }

    }
}
module.exports = HomepageController;