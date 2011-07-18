var dns = require('dns');

var request = require('request')
  , querystring = require('querystring');

var NerdieInterface = require('../nerdie_interface.js');
var key = null
  , config = null;

function IPInfo(parentNerdie) {
	config = (parentNerdie.config.plugins.ipinfo) ? parentNerdie.config.plugins.ipinfo : {};

	this.pluginInterface = new NerdieInterface(parentNerdie, this);
}

function ucfirst(str) { 
	return str.toLowerCase().replace(/\b\w/g, function(e){return e.toUpperCase()}); 
}

IPInfo.prototype.init = function () {
	this.pluginInterface.registerPattern(
		this.pluginInterface.anchoredPattern('dns', true),
		this.getDNS
	);
	this.pluginInterface.registerPattern(
		this.pluginInterface.anchoredPattern('ipinfo', true),
		this.getIPInfo
	);
};

// this could probably be its own plugin
IPInfo.prototype.getDNS = function(msg) {
	dns.resolve( msg.match_data[2], function (err, address) {
		if (err) throw err;

		// first result is as good as any.
		msg.say(msg.user + ": " + msg.match_data[2] + " = " + address[0]);
	});
	
};


IPInfo.prototype.getIPInfo = function(msg) {
	if (!config || !config.key) {
		msg.say('You need an IPInfo API key. Get one here: http://www.ipinfodb.com/register.php');
		return;
	}
	key = config.key;

	var q = querystring.stringify({"ip": msg.match_data[2], "format": "json", "key": key});

	// slower of the two APIs, but why not? Suppose this could be a config option.
	var uri = 'http://api.ipinfodb.com/v3/ip-city/?'+q;
	var response = ""
	  , conditions = {};

	request({uri: uri}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			try {
				body = JSON.parse(body);
			} catch (e) {
				msg.say("Argh. Could not parse response from " + uri + " .");
				return;
			}
			if (body.data && body.data.error) {
				msg.say("Whoops, there were some errors with that query:");
				body.data.error.forEach(function(value, index) {
					msg.say("[ERROR]: " + value.msg);
				});
				return;
			}
			if (body.statusCode == 'OK' && body.countryCode != '' ) {
				response = msg.match_data[2] + " - ";
				response += (body.ipAddress != msg.match_data[2] ) ? "(" + body.ipAddress + ") ": "";
				response += (body.cityName != "-" ) ? ucfirst(body.cityName) + ", " : "";
				response += (body.regionName != "-") ? ucfirst(body.regionName) + ", " : "";
				response += ucfirst(body.countryName);
				msg.say( msg.user + ": " + response );
			}
			else {
				msg.say("Whoops! I had some trouble with the IPInfo API for " + msg.match_data[2] + ". Sorry :-/.");
				return;
			}
		} else {
			msg.say("Whoops! I had some trouble with the IPInfo API for " + msg.match_data[2] + ". Sorry :-/.");
			return;
		}
	});
};

module.exports = IPInfo;
