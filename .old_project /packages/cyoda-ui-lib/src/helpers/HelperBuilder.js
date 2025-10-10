const fs = require("fs");

module.exports = class HelperBuilder {
  static whiteList = [
    "VITE_APP_API_BASE",
    "VITE_APP_AUTH0_DOMAIN",
    "VITE_APP_AUTH0_CLIENT_ID",
    "VITE_APP_AUTH0_AUDIENCE",
    "VITE_APP_AUTH0_REDIRECT_URI",
    "VITE_APP_AUTH0_ORGANIZATION",
  ];

  static saveConfigFileToPublicPath(basePath) {
    let envs = process.env;
    envs = Object.keys(envs)
      .filter((key) => {
        return key.indexOf("VITE_APP") > -1 && this.whiteList.indexOf(key)>0;
      });

    const objConf = {};
    envs.forEach(key => {
      objConf[key] = process.env[key];
    });
    fs.writeFileSync(basePath + "/public/config.json", JSON.stringify(objConf, null, 2));
  }
};
