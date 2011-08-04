var request = require('request');
var async = require('async');
var querystring = require('querystring');

var NerdieInterface = require('../nerdie_interface.js')
, config = null;

function GetTime(parentNerdie) {
	this.pluginInterface = new NerdieInterface(parentNerdie, this);
	config = parentNerdie.config.plugins.time;
}

/**
// Need a better way of explaining how to configure stuff in the config file
    "plugins": {
    	"time": {
           "key": "put your key here",
           "locations": [
        		{"q": "Philadelphia, PA", "placename": "Up Over"},
                {"q": "Melbourne", "placename": "Down Under"}
            ]
    	}
    }
*/

GetTime.prototype.init = function () {
	this.pluginInterface.registerPattern(
		this.pluginInterface.anchoredPattern('time', false),
		this.time
	);
	this.pluginInterface.registerPattern(
		this.pluginInterface.anchoredPattern('time', true),
		this.time
	);
};

GetTime.prototype.time = function(msg) {
	if (!config || !config.key) {
		msg.say('You need a weather API key. Get one here: http://worldweatheronline.com');
		return;
	}
	key = config.key;
	var response = ""
	  , conditions = {};

	var sum = '';

	if(msg.match_data[2] != undefined) {
		locations = [ {"q": msg.match_data[2], "placename": msg.match_data[2]} ];
	}
	else {
		locations = config.locations;
	}
	console.log(locations, config);

	async.forEachSeries(
		locations, 
		function(item, callback){
			q = querystring.stringify({"q": item.q, "format": "json", "key": key});
			uri = 'http://free.worldweatheronline.com/feed/tz.ashx?'+q;
			request({uri: uri}, function (error, response, body) {
				console.log('Result for ', item, response.statusCode, body);
				if(sum != '') {
					sum += '  |  ';
				}
				if (!error && response.statusCode == 200) {
					body = JSON.parse(body)
					if (body.data && body.data.error) {
						msg.say("Whoops, there were some errors with that query:");
						body.data.error.forEach(function(value, index) {
							msg.say("[ERROR]: " + value.msg);
						});
						return;
					}
					else {
						sum += item.placename + ': ' + body.data.time_zone[0].localtime;
					}
				} else {
					sum += item.placename + ': ' + 'API Error';
				}
				callback();
			});
		},
		function(result) {
			msg.say(msg.user + ": " + sum);
		}
	);

};

module.exports = GetTime;
