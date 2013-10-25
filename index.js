var PBW = require('./src/node-pbw');

module.exports = PBW;

if (require.main === module) {
  PBW.loadUrl(process.argv[2], function (err, app) {
    if (err) {
      return console.log(err);
    }
    console.log(app);
  });
}
