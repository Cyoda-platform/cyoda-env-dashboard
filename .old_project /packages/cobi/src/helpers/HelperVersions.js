const moment = require("moment");
const { execSync } = require("child_process");

module.exports = class HelperVersions {
  static addVersionsToEnv(basePath) {
    // Set Version
    import.meta.env.VITE_APP_UI_VERSION = require(`${basePath}/package.json`).version;

    // Set Build Time
    import.meta.env.VITE_APP_UI_BUILD_TIME = moment().format();

    // Set Branch Name
    const branchName = execSync("git branch --show-current");
    import.meta.env.VITE_APP_UI_BRANCH_NAME = branchName;
  }
};
