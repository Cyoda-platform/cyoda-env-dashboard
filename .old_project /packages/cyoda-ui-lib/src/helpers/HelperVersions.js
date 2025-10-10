const moment = require("moment");
const { execSync } = require('child_process');

module.exports = class HelperVersions {
    static addVersionsToEnv(basePath) {
        // Set Version
        process.env.VITE_APP_UI_VERSION = require(`${basePath}/package.json`).version;

        // Set Build Time
        process.env.VITE_APP_UI_BUILD_TIME = moment().format();

        // Set Branch Name
        const branchName = execSync('git branch --show-current').toString().trim();
        process.env.VITE_APP_UI_BRANCH_NAME = branchName;
    }
}
