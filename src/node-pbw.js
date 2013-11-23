module.exports = (function () {

  var AdmZip = require('adm-zip');
  var url = require('url');
  var http = require('http');
  var request = require('request');
  var _ = require('underscore');
      _.str = require('underscore.string');

  return {
    loadFile: loadFile,
    loadUrl: loadUrl,
    load: load
  };

  function loadFile(path, callback) {
    var pbw = new AdmZip(path); 
    return getAppInfo(pbw, callback);
  }

  function loadUrl(pbwUrl, callback) {
    fetchPbw(pbwUrl, function (err, pbw) {
      if (err) {
        return callback(err);
      }
      return getAppInfo(pbw, callback);
    });
  }

  function load(data, callback) {
    var pbw = new AdmZip(data); 
    return getAppInfo(pbw, callback);
  }

  function fetchPbw(pbwUrl, callback) {
    request(pbwUrl, { encoding: null }, function (err, response, body) {
      var zip = new AdmZip(body);
      return callback(null, zip);
    });
  }

  function getAppInfo(pbw, callback) {
    if (pbw.getEntry('appinfo.json')) {
      return getAppInfoV2(pbw, callback);
    }
    else if (pbw.getEntry('pebble-app.bin')) {
      return getAppInfoV1(pbw, callback);
    }
    else {
      return callback(new Error('Not a valid PBW file.'));
    }
  }

  function getAppInfoV1(pbw, callback) {
    var bin = pbw.getEntry('pebble-app.bin');
    var binData = bin.getData();
    var binName = new Buffer(32);
    var binCompany = new Buffer(32);
    var binUUID = new Buffer(16)
    binData.copy(binName, 0, 24, 56);
    binData.copy(binCompany, 0, 56, 88);
    binData.copy(binUUID, 0, 108, 124);
    var strUuid = binUUID.toString('hex');
    strUuid = strUuid.substr(0, 8) + '-'
      + strUuid.substr(8, 4) + '-'
      + strUuid.substr(12, 4) + '-'
      + strUuid.substr(16, 4) + '-'
      + strUuid.substr(20, 12);

    var manifest = JSON.parse(pbw.readAsText(pbw.getEntry('manifest.json')));

    var app = {
      name: _.str.trim(binName.toString(), '\0'),
      company: _.str.trim(binCompany.toString(), '\0'),
      uuid: strUuid,
      pebbleVersion: 1,
      firmwareVersion: manifest.application.reqFwVer
    };

    return callback(null, app);
  }

  function getAppInfoV2(pbw, callback) {
    var appinfo = JSON.parse(pbw.readAsText(pbw.getEntry('appinfo.json')));
    var manifest = JSON.parse(pbw.readAsText(pbw.getEntry('manifest.json')));

    var app = {
      name: appinfo.shortName,
      longName: appinfo.longName,
      uuid: appinfo.uuid,
      company: appinfo.companyName,
      version: {
        code: appinfo.versionCode,
        label: appinfo.versionLabel
      },
      type: (appinfo.watchapp.watchface ? 'watchface' : 'app'),
      pebbleVersion: 2,
      sdk: {
        major: manifest.application.sdk_version.major,
        minor: manifest.application.sdk_version.minor
      }
    };
    return callback(null, app);
  }
  
}());