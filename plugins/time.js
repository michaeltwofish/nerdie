var request = require('request');

var NerdieInterface = require('../nerdie_interface.js')
, config = null;

function GetTime(parentNerdie) {
	this.pluginInterface = new NerdieInterface(parentNerdie, this);
	config = parentNerdie.config.plugins.time;
}

GetTime.prototype.init = function () {
	this.pluginInterface.registerPattern(
		this.pluginInterface.anchoredPattern('time', false),
		this.time
	);
};

GetTime.prototype.time = function(msg) {

	var fulfilled = {};
	//console.log('Time executed', config);

	for(var place in config) {
		//console.log(place, config[place]);
		uri = 'http://www.timeapi.org/' + encodeURIComponent(config[place].zone) + '/now?\\a%20\\b%20\\d%20\\I:\\M%20\\p%20\\Y';
		var e = place;

		//console.log('Requesting: ' + uri);
		request({uri: uri}, function (error, response, body) {
			console.log('Result for ', e, place, response.statusCode, body);
			if (!error && response.statusCode == 200) {
				fulfilled[config[place].placename] = body;
			} else {
				fulfilled[place.placename] = 'API Error';
			}
			if(fulfilled.length == config.length) {
				var sum = [];
				for(var item in fulfilled) {
					sum.push(item + ': ' + fulfilled[item])
				}
				sum = sum.join('  |  ');
				
				msg.say(msg.user + ": " + sum);
				return;
			}
		});
		
	}

};


module.exports = GetTime;
