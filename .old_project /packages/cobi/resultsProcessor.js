module.exports = function () {
  require('../../node_modules/jest-teamcity-reporter').apply(this, arguments);
  // add any other processor you need
  return require('../../node_modules/jest-sonar-reporter').apply(this, arguments);
};
