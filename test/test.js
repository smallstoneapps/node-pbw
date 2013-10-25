var should = require('should');
var PBW = require('../index');

describe('PBW', function () {

  describe('#loadUrl()', function () {

    it('should get the details for a V2 app', function (done) {
      PBW.loadUrl('http://smallstoneapps.s3.amazonaws.com/sliders/builds/sliders-2.0.pbw', function (err, app) {
        should.not.exist(err);
        should.exist(app);
        should.equal(app.name, 'Sliders');
        should.equal(app.company, 'Matthew Tole');
        should.equal(app.uuid, '646aa5c6-74a3-46c8-ba44-d918a302ac77'); 
        done();
      });
    })

    it('should get the details for a V1 app', function (done) {
      PBW.loadUrl('http://smallstoneapps.s3.amazonaws.com/misc/simply_alarm_watchapp_v1.3.pbw', function (err, app) {
        should.not.exist(err);
        should.exist(app);
        should.equal(app.name, 'Simply Alarm');
        should.equal(app.company, 'RebootsRamblings');
        should.equal(app.uuid, 'e4168f6c-b485-4b6f-99c4-94aa957e86d4'); 
        done();
      });
    });

  });

});