module.exports = (function () {

  var AdmZip = require('adm-zip');
  var url = require('url');
  var http = require('http');
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
    var options = {
      host: url.parse(pbwUrl).host,
      port: 80,
      path: url.parse(pbwUrl).pathname
    };
    http.get(options, function (res) {
      var data = [];
      var dataLen = 0; 

      res.on('data', function (chunk) {
        data.push(chunk);
        dataLen += chunk.length;
      });

      res.on('error', function (err) {
        return callback(err);
      });

      res.on('end', function () {
        var buf = new Buffer(dataLen);
        for (var i=0, len = data.length, pos = 0; i < len; i++) { 
          data[i].copy(buf, pos); 
          pos += data[i].length; 
        } 
        try {
          var zip = new AdmZip(buf); 
          return callback(null, zip);
        }
        catch (e) {
          return callback(e);
        }
      });
    });
  }

  function getAppInfo(pbw, callback) {
    var appinfo = getZipEntryByName(pbw, 'appinfo.json');
    if (appinfo) {
      return getAppInfoV2(pbw, callback);
    }
    else {
      return getAppInfoV1(pbw, callback);
    }
  }

  function getAppInfoV1(pbw, callback) {
    var bin = getZipEntryByName(pbw, 'pebble-app.bin');
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

    var app = {
      name: _.str.trim(binName.toString(), '\0'),
      company: _.str.trim(binCompany.toString(), '\0'),
      uuid: strUuid,
      pebbleVersion: 1
    };
    return callback(null, app);
  }

  function getAppInfoV2(pbw, callback) {
    var appinfo = JSON.parse(pbw.readAsText(getZipEntryByName(pbw, 'appinfo.json')));
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
      pebbleVersion: 2
    };
    return callback(null, app);
  }

  function getZipEntryByName(zip, name) {
    return _.find(zip.getEntries(), function (entry) { return entry.name === name });
  }
  
}());