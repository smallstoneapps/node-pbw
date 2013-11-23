var PBW = require('./src/node-pbw');

module.exports = PBW;

if (require.main === module) {
  if (process.argv[2] == '-url') {
    PBW.loadUrl(process.argv[3], function (err, app) {
      if (err) {
        return console.log(err);
      }
      console.log(app);
    });
  }
  else if (process.argv[2] == '-file') {
    PBW.loadFile(process.argv[3], function (err, app) {
      if (err) {
        return console.log(err);
      }
      console.log(app);
    });
  }
}
